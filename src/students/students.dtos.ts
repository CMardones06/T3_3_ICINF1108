import { Type } from "class-transformer"
import {
	IsArray,
	IsEmail,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	Matches,
	Max,
	Min,
	ValidateNested,
} from "class-validator"

import { CreatePetDto } from "@/pets/pets.dtos"

const NO_HTML_PATTERN = /^[^<>]*$/
const NO_HTML_MESSAGE = "No se permiten etiquetas HTML"

const USERNAME_PATTERN = /^[a-z0-9_]+$/
const USERNAME_MESSAGE =
	"El nombre de usuario solo puede contener minúsculas, números y guiones bajos"

export class CreateStudentDto {
	@IsString({ message: "El nombre debe ser un texto" })
	@IsNotEmpty({ message: "El nombre no puede estar vacío" })
	@Length(3, 100, {
		message: "El nombre debe tener entre 3 y 100 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	name!: string

	@IsString({ message: "El nombre de usuario debe ser un texto" })
	@IsNotEmpty({ message: "El nombre de usuario no puede estar vacío" })
	@Length(3, 30, {
		message: "El nombre de usuario debe tener entre 3 y 30 caracteres",
	})
	@Matches(USERNAME_PATTERN, { message: USERNAME_MESSAGE })
	username!: string

	@IsEmail({}, { message: "El correo electrónico no es válido" })
	@IsNotEmpty({ message: "El correo electrónico no puede estar vacío" })
	email!: string

	@IsInt({ message: "La edad debe ser un número entero" })
	@Min(18, { message: "La edad debe ser al menos 18" })
	@Max(99, { message: "La edad debe ser como máximo 99" })
	age!: number

	@IsOptional()
	@IsArray({ message: "Las mascotas deben ser una lista" })
	@ValidateNested({ each: true })
	@Type(() => CreatePetDto)
	pets?: CreatePetDto[]
}

export class UpdateStudentDto {
	@IsOptional()
	@IsString({ message: "El nombre debe ser un texto" })
	@Length(3, 100, {
		message: "El nombre debe tener entre 3 y 100 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	name?: string

	@IsOptional()
	@IsString({ message: "El nombre de usuario debe ser un texto" })
	@Length(3, 30, {
		message: "El nombre de usuario debe tener entre 3 y 30 caracteres",
	})
	@Matches(USERNAME_PATTERN, { message: USERNAME_MESSAGE })
	username?: string

	@IsOptional()
	@IsEmail({}, { message: "El correo electrónico no es válido" })
	email?: string

	@IsOptional()
	@IsInt({ message: "La edad debe ser un número entero" })
	@Min(18, { message: "La edad debe ser al menos 18" })
	@Max(99, { message: "La edad debe ser como máximo 99" })
	age?: number
}
