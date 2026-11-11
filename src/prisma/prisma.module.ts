import { Global, Module } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

// Global: cualquier módulo puede inyectar PrismaService sin importarlo.
@Global()
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
