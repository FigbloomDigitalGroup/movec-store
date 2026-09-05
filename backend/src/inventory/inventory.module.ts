import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdminInventoryController } from './admin-inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminInventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
