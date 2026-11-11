import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiCookieAuth } from "@nestjs/swagger"

import { SessionGuard } from "@/auth/session.guard"
import { PetsService } from "@/pets/pets.service"
import { CreatePetDto, UpdatePetDto } from "@/pets/pets.dtos"

@ApiCookieAuth()
@UseGuards(SessionGuard)
@Controller("api/students/:studentId/pets")
export class PetsController {
	constructor(private readonly petsService: PetsService) {}

	@Get()
	public async findAll(@Param("studentId") studentId: string) {
		const pets = await this.petsService.findAllForStudent(studentId)
		return {
			total: pets.length,
			items: pets,
		}
	}

	@Post()
	public create(@Param("studentId") studentId: string, @Body() body: CreatePetDto) {
		return this.petsService.create(studentId, body)
	}

	@Patch(":petId")
	public update(
		@Param("studentId") studentId: string,
		@Param("petId") petId: string,
		@Body() body: UpdatePetDto,
	) {
		return this.petsService.update(studentId, petId, body)
	}

	@Delete(":petId")
	public delete(@Param("studentId") studentId: string, @Param("petId") petId: string) {
		return this.petsService.delete(studentId, petId)
	}
}
