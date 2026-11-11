import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { Prisma, PrismaClient } from "@prisma/client"

import { config } from "@/shared/config"

// Cliente de Prisma o el cliente de una transacción en curso.
export type PrismaTx = Prisma.TransactionClient

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor() {
		super({ datasourceUrl: config.databaseUrl })
	}

	async onModuleInit() {
		await this.$connect()
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}
}
