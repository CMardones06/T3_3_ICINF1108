import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common"

import { hashPassword, verifyPassword } from "./password"
import { RegisterDto, LoginDto } from "@/auth/auth.dtos"
import { PublicUser, UsersRepository } from "@/users/users.repository"

@Injectable()
export class AuthService {
	constructor(private readonly usersRepository: UsersRepository) {}

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

		// Mismo mensaje si el correo no existe o la contraseña es incorrecta,
		// para no revelar qué correos están registrados.
		if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
			throw new UnauthorizedException("Correo o contraseña incorrectos")
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...publicUser } = user
		return publicUser
	}

	public findById(id: string): Promise<PublicUser | null> {
		return this.usersRepository.findById(id)
	}
}
