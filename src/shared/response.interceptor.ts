import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { HTTP_CODE_METADATA } from "@nestjs/common/constants"
import { Reflector } from "@nestjs/core"
import { map, Observable } from "rxjs"
import { ApiResponse } from "./response"

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	constructor(private readonly reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse> {
		const request = context.switchToHttp().getRequest()
		const method: string = request.method

		return next.handle().pipe(
			map((data) => {
				const response = context.switchToHttp().getResponse()

				// Respeta @HttpCode(...) (por ejemplo, el login responde 200).
				const explicitCode = this.reflector.get<number | undefined>(
					HTTP_CODE_METADATA,
					context.getHandler(),
				)
				const code = explicitCode ?? (method === "POST" ? 201 : response.statusCode)

				response.status(code)

				const message =
					method === "POST" && code !== 201 ? "Operación exitosa" : this.getMessage(method)

				return new ApiResponse(
					code,
					true,
					message,
					new Date().toISOString(),
					data,
				)
			}),
		)
	}

	private getMessage(method: string): string {
		switch (method) {
			case "GET":
				return "Operación exitosa"
			case "POST":
				return "Recurso creado"
			case "PATCH":
				return "Recurso actualizado"
			case "DELETE":
				return "Recurso eliminado"
			default:
				return "OK"
		}
	}
}
