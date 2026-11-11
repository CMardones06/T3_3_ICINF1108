import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import type { Request } from "express"

import "./session"

// Deja pasar la petición solo si la sesión tiene un usuario autenticado.
@Injectable()
export class SessionGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>()

		if (!request.session?.userId) {
			throw new UnauthorizedException("Debes iniciar sesión para acceder a este recurso")
		}

		return true
	}
}
