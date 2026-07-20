import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { AdminModulesController } from './admin-modules.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModulesController, AdminModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class StoreModulesModule {}
