import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common"
import { ApiCookieAuth } from "@nestjs/swagger"

import { SessionGuard } from "@/auth/session.guard"
import { StudentsService } from "@/students/students.service"
import { CreateStudentDto, UpdateStudentDto } from "@/students/students.dtos"

@ApiCookieAuth()
@UseGuards(SessionGuard)
@Controller("api/students")
export class StudentsController {
	constructor(private readonly studentsService: StudentsService) {}

	@Get()
	public async findAll() {
		const students = await this.studentsService.findAll()
		return {
			total: students.length,
			items: students,
		}
	}

	@Get(":id")
	public findById(@Param("id") id: string) {
		return this.studentsService.findById(id)
	}

	@Post()
	public create(@Body() body: CreateStudentDto) {
		return this.studentsService.create(body)
	}

	@Patch(":id")
	public update(@Param("id") id: string, @Body() body: UpdateStudentDto) {
		return this.studentsService.update(id, body)
	}

	@Delete(":id")
	public delete(@Param("id") id: string) {
		return this.studentsService.delete(id)
	}
}
