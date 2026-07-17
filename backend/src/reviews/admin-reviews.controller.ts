import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getAll() {
    return this.reviewsService.getAllReviews();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.reviewsService.approveReview(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}