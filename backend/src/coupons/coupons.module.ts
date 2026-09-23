import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { AdminCouponsController } from './admin-coupons.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminCouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
