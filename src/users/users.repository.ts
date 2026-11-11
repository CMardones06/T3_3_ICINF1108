import { Injectable } from "@nestjs/common"
import type { Prisma, User } from "@prisma/client"
import { isUUID } from "class-validator"

import { PrismaService } from "@/prisma/prisma.service"

// Usuario sin el hash de la contraseña: lo único que sale de la API.
export type PublicUser = Omit<User, "passwordHash">

// El hash se omite en todas las consultas salvo en la del login.
const OMIT_PASSWORD = { passwordHash: true } as const

@Injectable()
export class UsersRepository {
	constructor(private readonly prisma: PrismaService) {}

	public async findById(id: string): Promise<PublicUser | null> {
		if (!isUUID(id)) return null

		return this.prisma.user.findUnique({ where: { id }, omit: OMIT_PASSWORD })
	}

	public findByEmail(email: string): Promise<PublicUser | null> {
		return this.prisma.user.findUnique({ where: { email }, omit: OMIT_PASSWORD })
	}

	// Única consulta que incluye el hash de la contraseña (para el login).
	public findByEmailWithPassword(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { email } })
	}

	public create(data: Prisma.UserCreateInput): Promise<PublicUser> {
		return this.prisma.user.create({ data, omit: OMIT_PASSWORD })
	}
}
