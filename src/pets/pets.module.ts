import { forwardRef, Module } from "@nestjs/common"
import { PetsService } from "@/pets/pets.service"
import { PetsController } from "@/pets/pets.controller"
import { PetsRepository } from "@/pets/pets.repository"
import { StudentsModule } from "@/students/students.module"

@Module({
	imports: [forwardRef(() => StudentsModule)],
	controllers: [PetsController],
	providers: [PetsService, PetsRepository],
	exports: [PetsService, PetsRepository],
})
export class PetsModule {}
