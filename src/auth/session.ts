import type { Request } from "express"
import type { Session } from "express-session"

// Datos que guardamos en la sesión. Se almacenan en Postgres (tabla
// `user_sessions`); al navegador solo llega una cookie con el id de sesión.
declare module "express-session" {
	interface SessionData {
		userId: string
	}
}

// Inicia la sesión de un usuario. `regenerate` crea un id de sesión nuevo
// para evitar ataques de fijación de sesión.
export async function startSession(request: Request, userId: string): Promise<void> {
	await new Promise<void>((resolve, reject) =>
		request.session.regenerate((err) => (err ? reject(err) : resolve())),
	)

	request.session.userId = userId

	await new Promise<void>((resolve, reject) =>
		request.session.save((err) => (err ? reject(err) : resolve())),
	)
}

export function destroySession(session: Session): Promise<void> {
	return new Promise<void>((resolve, reject) =>
		session.destroy((err) => (err ? reject(err) : resolve())),
	)
}
