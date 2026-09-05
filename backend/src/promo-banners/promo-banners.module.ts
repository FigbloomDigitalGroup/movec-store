import { Module } from '@nestjs/common';
import { PromoBannersController } from './promo-banners.controller';
import { PromoBannersService } from './promo-banners.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PromoBannersController],
  providers: [PromoBannersService],
  exports: [PromoBannersService],
})
export class PromoBannersModule {}
