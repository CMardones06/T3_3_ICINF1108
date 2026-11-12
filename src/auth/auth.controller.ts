import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common"
import { ApiCookieAuth } from "@nestjs/swagger"
import type { Request, Response } from "express"

import { AuthService } from "@/auth/auth.service"
import { ForgotPasswordDto, LoginDto, RegisterDto } from "@/auth/auth.dtos"
import { SessionGuard } from "@/auth/session.guard"
import { destroySession, startSession } from "@/auth/session"
import { SESSION_COOKIE_NAME } from "@/shared/config"

@Controller("api/auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// Crea la cuenta e inicia sesión de inmediato.
	@Post("register")
	public async register(@Body() body: RegisterDto, @Req() request: Request) {
		const user = await this.authService.register(body)
		await startSession(request, user.id)
		return user
	}

	@Post("login")
	@HttpCode(200)
	public async login(@Body() body: LoginDto, @Req() request: Request) {
		const user = await this.authService.login(body)
		await startSession(request, user.id)
		return user
	}

	@Post("password/forgot")
	@HttpCode(202)
	public async forgotPassword(@Body() body: ForgotPasswordDto) {
		await this.authService.requestPasswordReset(body.email)

		return {
			message: "Si el correo está registrado, recibirás un enlace de recuperación.",
		}
	}

	@Post("logout")
	@HttpCode(200)
	public async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		await destroySession(request.session)
		response.clearCookie(SESSION_COOKIE_NAME)
		return null
	}

	@Get("me")
	@ApiCookieAuth()
	@UseGuards(SessionGuard)
	public async me(@Req() request: Request) {
		const user = await this.authService.findById(request.session.userId!)

		// La sesión apunta a un usuario que ya no existe.
		if (!user) {
			await destroySession(request.session)
			throw new UnauthorizedException("Debes iniciar sesión para acceder a este recurso")
		}

		return user
	}
}
