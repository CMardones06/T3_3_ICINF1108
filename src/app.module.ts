import { Module } from "@nestjs/common"
import { AuthModule } from "@/auth/auth.module"
import { PetsModule } from "@/pets/pets.module"
import { PrismaModule } from "@/prisma/prisma.module"
import { StudentsModule } from "@/students/students.module"

@Module({
	imports: [PrismaModule, AuthModule, StudentsModule, PetsModule],
})
export class AppModule {}
