import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { AuthController } from "@/auth/auth.controller"
import { AuthService } from "@/auth/auth.service"
import { UsersModule } from "@/users/users.module"

@Module({
	imports: [UsersModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
