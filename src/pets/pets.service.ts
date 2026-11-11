import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import type { Pet } from "@prisma/client"

import { PetsRepository } from "./pets.repository"
import { CreatePetDto, UpdatePetDto } from "@/pets/pets.dtos"
import { StudentsService } from "@/students/students.service"

@Injectable()
export class PetsService {
	constructor(
		private readonly petsRepository: PetsRepository,
		private readonly studentsService: StudentsService,
	) {}

	public async findAllForStudent(studentId: string): Promise<Pet[]> {
		await this.assertStudentExists(studentId)

		return this.petsRepository.findAllByStudent(studentId)
	}

	public async create(studentId: string, data: CreatePetDto): Promise<Pet> {
		await this.assertStudentExists(studentId)
		await this.assertNoConflicts(studentId, data)

		return this.petsRepository.create({
			studentId,
			name: data.name,
			species: data.species,
			age: data.age ?? null,
		})
	}

	public async update(studentId: string, petId: string, data: UpdatePetDto): Promise<Pet> {
		await this.findOwned(studentId, petId)
		await this.assertNoConflicts(studentId, data, petId)

		// Los campos `undefined` no se modifican.
		return this.petsRepository.update(petId, {
			name: data.name,
			species: data.species,
			age: data.age,
		})
	}

	public async delete(studentId: string, petId: string): Promise<Pet> {
		const existing = await this.findOwned(studentId, petId)
		await this.petsRepository.delete(petId)
		return existing
	}

	private async findOwned(studentId: string, petId: string): Promise<Pet> {
		await this.assertStudentExists(studentId)

		const pet = await this.petsRepository.findById(petId)

		if (!pet || pet.studentId !== studentId) {
			throw new NotFoundException("Mascota no encontrada")
		}

		return pet
	}

	private async assertStudentExists(studentId: string): Promise<void> {
		await this.studentsService.findById(studentId)
	}

	private async assertNoConflicts(
		studentId: string,
		data: { name?: string },
		exceptId?: string,
	): Promise<void> {
		if (!data.name) return

		const existing = await this.petsRepository.findByStudentAndName(studentId, data.name)

		if (existing && existing.id !== exceptId) {
			throw new ConflictException({
				message: "Conflicto con datos existentes",
				errors: {
					name: { message: "Ya tienes una mascota con ese nombre" },
				},
			})
		}
	}
}
