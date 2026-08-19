import { Module } from '@nestjs/common';
import { InstallationService } from './installation.service';
import { InstallationController } from './installation.controller';
import { AdminInstallationController } from './admin-installation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstallationController, AdminInstallationController],
  providers: [InstallationService],
  exports: [InstallationService],
})
export class InstallationModule {}
