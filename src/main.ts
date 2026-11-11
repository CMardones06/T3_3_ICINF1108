import { AppModule } from "@/app.module"
import { NestFactory, Reflector } from "@nestjs/core"
import { BadRequestException, ValidationPipe } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AllExceptionsFilter } from "@/shared/all-exceptions.filter"
import { ResponseInterceptor } from "@/shared/response.interceptor"
import { ValidationError } from "class-validator"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import { config, SESSION_COOKIE_NAME } from "@/shared/config"

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	app.useStaticAssets("public")

	// Sesiones guardadas en Postgres: el navegador solo recibe una cookie
	// httpOnly con el id de la sesión; los datos quedan en la tabla `user_sessions`.
	const PgSessionStore = connectPgSimple(session)

	app.use(
		session({
			name: SESSION_COOKIE_NAME,
			secret: config.sessionSecret,
			store: new PgSessionStore({
				conString: config.databaseUrl,
				// La tabla la crea la migración de Prisma (modelo UserSession).
				tableName: "user_sessions",
			}),
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				sameSite: "lax",
				secure: config.sessionCookieSecure,
				maxAge: config.sessionMaxAgeMs,
			},
		}),
	)

	app.useGlobalFilters(new AllExceptionsFilter())
	app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))

	app.enableCors({
		origin: "*",
	})

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			exceptionFactory: (errors: ValidationError[]) => new BadRequestException(errors),
		}),
	)

	const swaggerConfig = new DocumentBuilder()
		.setTitle("NestJS CRUD Students & Pets")
		.setDescription(
			"API de un CRUD con PostgreSQL para la entidad Student y sus mascotas (Pet), " +
				"protegida con sesiones. Inicia sesión en /api/auth/login para usar los endpoints.",
		)
		.setVersion("1.0")
		.addCookieAuth(SESSION_COOKIE_NAME)
		.build()

	const document = SwaggerModule.createDocument(app, swaggerConfig)

	SwaggerModule.setup("docs", app, document)

	await app.listen(3000, "0.0.0.0")

	console.log("Application running on: http://localhost:3000")
	console.log("Documentation at: http://localhost:3000/docs")
}

bootstrap()
