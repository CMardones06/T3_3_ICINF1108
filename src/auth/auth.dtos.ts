import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator"

const NO_HTML_PATTERN = /^[^<>]*$/
const NO_HTML_MESSAGE = "No se permiten etiquetas HTML"

export class RegisterDto {
	@IsString({ message: "El nombre debe ser un texto" })
	@IsNotEmpty({ message: "El nombre no puede estar vacío" })
	@Length(3, 100, {
		message: "El nombre debe tener entre 3 y 100 caracteres",
	})
	@Matches(NO_HTML_PATTERN, { message: NO_HTML_MESSAGE })
	name!: string

	@IsEmail({}, { message: "El correo electrónico no es válido" })
	@IsNotEmpty({ message: "El correo electrónico no puede estar vacío" })
	email!: string

	@IsString({ message: "La contraseña debe ser un texto" })
	@Length(8, 72, {
		message: "La contraseña debe tener entre 8 y 72 caracteres",
	})
	password!: string
}

export class LoginDto {
	@IsEmail({}, { message: "El correo electrónico no es válido" })
	@IsNotEmpty({ message: "El correo electrónico no puede estar vacío" })
	email!: string

	@IsString({ message: "La contraseña debe ser un texto" })
	@IsNotEmpty({ message: "La contraseña no puede estar vacía" })
	password!: string
}

export class ForgotPasswordDto {
	@IsEmail({}, { message: "El correo electrónico no es válido" })
	@IsNotEmpty({ message: "El correo electrónico no puede estar vacío" })
	email!: string
}

export class ResetPasswordDto {
    @IsString({ message: "El token debe ser un texto" })
    @IsNotEmpty({ message: "El token de recuperación es obligatorio" })
    reset_token!: string

    @IsString({ message: "La contraseña debe ser un texto" })
    @Length(8, 72, {
        message: "La contraseña debe tener entre 8 y 72 caracteres",
    })
    new_password!: string
} 