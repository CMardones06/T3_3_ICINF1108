import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import type { Student } from "@prisma/client"

import { StudentsRepository } from "./students.repository"
import { PetsRepository } from "@/pets/pets.repository"
import { PrismaService, PrismaTx } from "@/prisma/prisma.service"
import { CreateStudentDto, UpdateStudentDto } from "@/students/students.dtos"
import type { ValidationErrors } from "@/shared/response"

@Injectable()
export class StudentsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly studentsRepository: StudentsRepository,
		private readonly petsRepository: PetsRepository,
	) {}

	public findAll(): Promise<Student[]> {
		return this.studentsRepository.findAll()
	}

	public async findById(id: string): Promise<Student> {
		const student = await this.studentsRepository.findById(id)

		if (!student) {
			throw new NotFoundException("Estudiante no encontrado")
		}

		return student
	}

	public create(data: CreateStudentDto): Promise<Student> {
		// El estudiante y sus mascotas se insertan en una sola transacción: si
		// cualquier mascota falla, Postgres hace rollback y no queda nada guardado.
		return this.prisma.$transaction(async (tx) => {
			await this.assertNoConflicts(data, undefined, tx)

			const student = await this.studentsRepository.create(
				{
					name: data.name,
					username: data.username,
					email: data.email,
					age: data.age,
				},
				tx,
			)

			for (const petData of data.pets ?? []) {
				const existing = await this.petsRepository.findByStudentAndName(
					student.id,
					petData.name,
					tx,
				)

				if (existing) {
					throw new ConflictException({
						message: "Conflicto con datos existentes",
						errors: {
							name: { message: "Ya tienes una mascota con ese nombre" },
						},
					})
				}

				await this.petsRepository.create(
					{
						studentId: student.id,
						name: petData.name,
						species: petData.species,
						age: petData.age ?? null,
					},
					tx,
				)
			}

			return student
		})
	}

	public async update(id: string, data: UpdateStudentDto): Promise<Student> {
		await this.findById(id)
		await this.assertNoConflicts(data, id)

		// Los campos `undefined` no se modifican.
		return this.studentsRepository.update(id, {
			name: data.name,
			username: data.username,
			email: data.email,
			age: data.age,
		})
	}

	public async delete(id: string): Promise<Student> {
		const existing = await this.findById(id)

		// Las mascotas se eliminan en cascada (ON DELETE CASCADE).
		await this.studentsRepository.delete(id)

		return existing
	}

	private async assertNoConflicts(
		data: { email?: string; username?: string },
		exceptId?: string,
		tx?: PrismaTx,
	): Promise<void> {
		const conflicts: ValidationErrors = {}

		if (data.email) {
			const existing = await this.studentsRepository.findByEmail(data.email, tx)

			if (existing && existing.id !== exceptId) {
				conflicts.email = { message: "El correo electrónico ya está en uso" }
			}
		}

		if (data.username) {
			const existing = await this.studentsRepository.findByUsername(data.username, tx)

			if (existing && existing.id !== exceptId) {
				conflicts.username = { message: "El nombre de usuario ya está en uso" }
			}
		}

		if (Object.keys(conflicts).length > 0) {
			throw new ConflictException({
				message: "Conflicto con datos existentes",
				errors: conflicts,
			})
		}
	}
}
