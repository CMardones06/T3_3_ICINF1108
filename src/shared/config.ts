// Si existe un archivo `.env`, se cargan sus variables (útil al correr la API
// sin Docker). Las variables ya definidas en el entorno tienen prioridad.
try {
	process.loadEnvFile()
} catch {
	// No hay `.env`: se usan las variables del entorno y los valores por defecto.
}

// Configuración leída desde variables de entorno. Los valores por defecto
// sirven para desarrollo local con el Postgres de docker-compose.yml.
export const config = {
	databaseUrl:
		process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/icinf1108",

	sessionSecret: process.env.SESSION_SECRET ?? "cambia-este-secreto-en-produccion",
	sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS ?? 1000 * 60 * 60 * 8),

	passwordResetJwtSecret: process.env.PASSWORD_RESET_JWT_SECRET,
	passwordResetClientUrl: process.env.PASSWORD_RESET_CLIENT_URL,
	passwordResetSimulateMail:
		process.env.NODE_ENV === "development" &&
		process.env.PASSWORD_RESET_SIMULATE_MAIL === "true",

	// Solo debe ser `true` cuando la app se sirve por HTTPS.
	sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === "true",
}

export const SESSION_COOKIE_NAME = "sid"
