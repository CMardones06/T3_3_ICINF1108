import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common"
import type { Response } from "express"
import { Prisma } from "@prisma/client"
import { ApiResponse, ValidationErrors } from "./response"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		let code: number
		let message: string
		let error: string | undefined
		let errors: ValidationErrors | undefined

		if (exception instanceof HttpException) {
			code = exception.getStatus()
			const res = exception.getResponse()

			if (typeof res === "object" && res !== null && "message" in res) {
				const body = res as Record<string, unknown>
				const rawMessage = body.message

				if (body.errors && this.isValidationErrors(body.errors)) {
					message = typeof rawMessage === "string" ? rawMessage : exception.message
					errors = body.errors
				} else if (Array.isArray(rawMessage) && this.isValidationErrorArray(rawMessage)) {
					message = "Error de validación"
					errors = this.formatValidationErrors(rawMessage)
				} else {
					message = typeof rawMessage === "string" ? rawMessage : exception.message
					error = message
				}
			} else {
				message = exception.message
				error = message
			}
		} else if (this.isUniqueViolation(exception)) {
			// Respaldo por si dos peticiones simultáneas pasan la validación de
			// unicidad del servicio: la restricción UNIQUE de Postgres responde.
			code = HttpStatus.CONFLICT
			message = "Conflicto con datos existentes"
			error = message
		} else {
			code = HttpStatus.INTERNAL_SERVER_ERROR
			message = "Error interno del servidor"
			error = message
		}

		response
			.status(code)
			.json(
				new ApiResponse(
					code,
					false,
					message,
					new Date().toISOString(),
					null,
					error,
					errors,
				),
			)
	}

	private isUniqueViolation(exception: unknown): boolean {
		// P2002: violación de una restricción UNIQUE en Prisma.
		return (
			exception instanceof Prisma.PrismaClientKnownRequestError && exception.code === "P2002"
		)
	}

	private isValidationErrorArray(items: unknown[]): boolean {
		return items.every(
			(item) =>
				typeof item === "object" &&
				item !== null &&
				"property" in item &&
				"constraints" in item,
		)
	}

	private isValidationErrors(value: unknown): value is ValidationErrors {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			return false
		}

		return Object.values(value).every(
			(entry) =>
				typeof entry === "object" &&
				entry !== null &&
				"message" in entry &&
				typeof entry.message === "string",
		)
	}

	private formatValidationErrors(
		items: Array<{ property: string; constraints?: Record<string, string> }>,
	): ValidationErrors {
		const result: ValidationErrors = {}

		for (const item of items) {
			if (item.constraints) {
				result[item.property] = {
					message: Object.values(item.constraints).join(", "),
				}
			}
		}

		return result
	}
}
