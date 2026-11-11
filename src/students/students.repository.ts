import { Injectable } from "@nestjs/common"
import type { Prisma, Student } from "@prisma/client"
import { isUUID } from "class-validator"

import { PrismaService, PrismaTx } from "@/prisma/prisma.service"

@Injectable()
export class StudentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	public findAll(): Promise<Student[]> {
		return this.prisma.student.findMany({ orderBy: { createdAt: "desc" } })
	}

	public async findById(id: string): Promise<Student | null> {
		// Un id que no es UUID haría fallar la consulta en Postgres; se trata
		// igual que un id inexistente para responder 404.
		if (!isUUID(id)) return null

		return this.prisma.student.findUnique({ where: { id } })
	}

	public findByEmail(email: string, tx?: PrismaTx): Promise<Student | null> {
		return this.client(tx).student.findUnique({ where: { email } })
	}

	public findByUsername(username: string, tx?: PrismaTx): Promise<Student | null> {
		return this.client(tx).student.findUnique({ where: { username } })
	}

	public create(data: Prisma.StudentCreateInput, tx?: PrismaTx): Promise<Student> {
		return this.client(tx).student.create({ data })
	}

	public update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
		return this.prisma.student.update({ where: { id }, data })
	}

	public async delete(id: string): Promise<void> {
		await this.prisma.student.delete({ where: { id } })
	}

	// Dentro de una transacción se usa el cliente de esa transacción;
	// fuera de ella, el cliente normal.
	private client(tx?: PrismaTx): PrismaTx {
		return tx ?? this.prisma
	}
}
