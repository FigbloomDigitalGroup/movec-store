import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    const user = req.user as any;
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(@Req() req: Request, @Body() dto: AddCartItemDto) {
    const user = req.user as any;
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const user = req.user as any;
    return this.cartService.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  removeItem(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.cartService.removeItem(user.id, id);
  }
}