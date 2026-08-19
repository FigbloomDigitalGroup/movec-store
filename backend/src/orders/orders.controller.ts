import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findMyOrders(@Req() req: Request, @Query('page') page = 1, @Query('limit') limit = 20) {
    const user = req.user as any;
    return this.ordersService.findByCustomer(user.id, +page, +limit);
  }

  @Get(':orderNumber')
  findOne(@Req() req: Request, @Param('orderNumber') orderNumber: string) {
    const user = req.user as any;
    return this.ordersService.findByOrderNumber(orderNumber, user.id);
  }

  @Post(':orderNumber/cancel')
  cancelOrder(@Req() req: Request, @Param('orderNumber') orderNumber: string) {
    const user = req.user as any;
    return this.ordersService.cancelOrder(orderNumber, user.id);
  }

  @Get(':orderNumber/invoice')
  getInvoice(@Req() req: Request, @Param('orderNumber') orderNumber: string) {
    const user = req.user as any;
    return this.ordersService.generateInvoice(orderNumber, user.id);
  }
}