import { Injectable } from "@nestjs/common"
import type { Pet, Prisma } from "@prisma/client"
import { isUUID } from "class-validator"

import { PrismaService, PrismaTx } from "@/prisma/prisma.service"

@Injectable()
export class PetsRepository {
	constructor(private readonly prisma: PrismaService) {}

	public findAllByStudent(studentId: string): Promise<Pet[]> {
		return this.prisma.pet.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } })
	}

	public async findById(id: string): Promise<Pet | null> {
		// Un id que no es UUID haría fallar la consulta en Postgres; se trata
		// igual que un id inexistente para responder 404.
		if (!isUUID(id)) return null

		return this.prisma.pet.findUnique({ where: { id } })
	}

	public findByStudentAndName(studentId: string, name: string, tx?: PrismaTx): Promise<Pet | null> {
		return this.client(tx).pet.findUnique({ where: { studentId_name: { studentId, name } } })
	}

	public create(data: Prisma.PetUncheckedCreateInput, tx?: PrismaTx): Promise<Pet> {
		return this.client(tx).pet.create({ data })
	}

	public update(id: string, data: Prisma.PetUpdateInput): Promise<Pet> {
		return this.prisma.pet.update({ where: { id }, data })
	}

	public async delete(id: string): Promise<void> {
		await this.prisma.pet.delete({ where: { id } })
	}

	private client(tx?: PrismaTx): PrismaTx {
		return tx ?? this.prisma
	}
}
