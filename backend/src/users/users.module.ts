import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminUsersController } from './admin.controller';
import { MeController } from './me.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminUsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}