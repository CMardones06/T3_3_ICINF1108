import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, Min } from "class-validator"

const NO_HTML_PATTERN = /^[^<>]*$/
const NO_HTML_MESSAGE = "No se permiten etiquetas HTML"

export class CreatePetDto {
	@IsString({ message: "El nombre debe ser un texto" })
	@IsNotEmpty({ message: "El nombre no puede estar vacío" })
	@Length(1, 50, {
		message: "El nombre debe tener entre 1 y 50 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	name!: string

	@IsString({ message: "La especie debe ser un texto" })
	@IsNotEmpty({ message: "La especie no puede estar vacía" })
	@Length(1, 50, {
		message: "La especie debe tener entre 1 y 50 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	species!: string

	@IsOptional()
	@IsInt({ message: "La edad debe ser un número entero" })
	@Min(0, { message: "La edad debe ser al menos 0" })
	@Max(100, { message: "La edad debe ser como máximo 100" })
	age?: number
}

export class UpdatePetDto {
	@IsOptional()
	@IsString({ message: "El nombre debe ser un texto" })
	@Length(1, 50, {
		message: "El nombre debe tener entre 1 y 50 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	name?: string

	@IsOptional()
	@IsString({ message: "La especie debe ser un texto" })
	@Length(1, 50, {
		message: "La especie debe tener entre 1 y 50 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	species?: string

	@IsOptional()
	@IsInt({ message: "La edad debe ser un número entero" })
	@Min(0, { message: "La edad debe ser al menos 0" })
	@Max(100, { message: "La edad debe ser como máximo 100" })
	age?: number
}
