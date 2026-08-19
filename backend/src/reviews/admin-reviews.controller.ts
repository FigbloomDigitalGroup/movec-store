import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { QueryReviewDto } from './dto/query-review.dto';
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
  getAll(@Query() query: QueryReviewDto) {
    return this.reviewsService.getAllReviews(query);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.reviewsService.approveReview(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.reviewsService.rejectReview(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}