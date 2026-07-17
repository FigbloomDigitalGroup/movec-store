import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: Request) {
    const user = req.user as any;
    return this.wishlistService.getWishlist(user.id);
  }

  @Post()
  addItem(@Req() req: Request, @Body() dto: AddWishlistItemDto) {
    const user = req.user as any;
    return this.wishlistService.addItem(user.id, dto.productId);
  }

  @Delete(':id')
  removeItem(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.wishlistService.removeItem(user.id, id);
  }
}