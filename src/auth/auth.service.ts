import {
    ConflictException,
    Injectable,
    Logger,
    ServiceUnavailableException,
    UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { randomUUID } from "node:crypto"

import { LoginDto, RegisterDto } from "@/auth/auth.dtos"
import { hashPassword, verifyPassword } from "./password"
import { PrismaService } from "@/prisma/prisma.service"
import { config } from "@/shared/config"
import { PublicUser, UsersRepository } from "@/users/users.repository"

const RESET_TTL_SECONDS = 15 * 60

interface ResetTokenPayload {
    sub: string
    jti: string
    purpose: string
    exp?: number
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    public async requestPasswordReset(email: string): Promise<void> {
        const { passwordResetJwtSecret, passwordResetClientUrl, passwordResetSimulateMail } =
            config

        if (!passwordResetJwtSecret || !passwordResetClientUrl || !passwordResetSimulateMail) {
            throw new ServiceUnavailableException("La recuperación de contraseña no está disponible")
        }

        const resetUrl = new URL(passwordResetClientUrl)
        const user = await this.usersRepository.findByEmail(email)
        if (!user) return

        const jti = randomUUID()
        const exp = Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS

        const resetToken = await this.jwtService.signAsync(
            { sub: user.id, jti, exp, purpose: "password_reset" },
            { secret: passwordResetJwtSecret, algorithm: "HS256" },
        )

        await this.prisma.passwordResetToken.create({
            data: {
                jti,
                userId: user.id,
                expiresAt: new Date(exp * 1000),
                isUsed: false,
            },
        })

        resetUrl.searchParams.set("reset_token", resetToken)
        this.logger.log(`Correo simulado para ${user.email}: ${resetUrl.toString()}`)
    }

    public async resetPassword(resetToken: string, newPassword: string): Promise<void> {
        const { passwordResetJwtSecret } = config

        if (!passwordResetJwtSecret) {
            throw new ServiceUnavailableException("La recuperación de contraseña no está disponible")
        }

        let payload: ResetTokenPayload
        try {
            payload = await this.jwtService.verifyAsync<ResetTokenPayload>(resetToken, {
                secret: passwordResetJwtSecret,
                algorithms: ["HS256"],
            })
        } catch {
            throw new UnauthorizedException("Token inválido o expirado")
        }

        if (payload.purpose !== "password_reset" || !payload.jti || !payload.sub) {
            throw new UnauthorizedException("Token inválido para esta operación")
        }

        const tokenRecord = await this.prisma.passwordResetToken.findUnique({
            where: { jti: payload.jti },
        })

        if (!tokenRecord || tokenRecord.isUsed || new Date() > tokenRecord.expiresAt) {
            throw new UnauthorizedException("El enlace de recuperación ya fue utilizado o expiró")
        }

        const passwordHash = await hashPassword(newPassword)

        await this.prisma.$transaction(async (tx) => {
            const updatedToken = await tx.passwordResetToken.updateMany({
                where: {
                    jti: payload.jti,
                    isUsed: false,
                },
                data: {
                    isUsed: true,
                },
            })

            if (updatedToken.count === 0) {
                throw new UnauthorizedException("El enlace de recuperación ya fue utilizado")
            }

            await tx.user.update({
                where: { id: payload.sub },
                data: { passwordHash },
            })

            await tx.$executeRaw`
                DELETE FROM "user_sessions"
                WHERE sess->>'userId' = ${payload.sub}
            `
        })
    }

    public async register(data: RegisterDto): Promise<PublicUser> {
        const existing = await this.usersRepository.findByEmail(data.email)

        if (existing) {
            throw new ConflictException({
                message: "Conflicto con datos existentes",
                errors: {
                    email: { message: "El correo electrónico ya está registrado" },
                },
            })
        }

        return this.usersRepository.create({
            name: data.name,
            email: data.email,
            passwordHash: await hashPassword(data.password),
        })
    }

    public async login(data: LoginDto): Promise<PublicUser> {
        const user = await this.usersRepository.findByEmailWithPassword(data.email)

        if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
            throw new UnauthorizedException("Correo o contraseña incorrectos")
        }

        const { passwordHash, ...publicUser } = user
        return publicUser
    }

    public findById(id: string): Promise<PublicUser | null> {
        return this.usersRepository.findById(id)
    }
}