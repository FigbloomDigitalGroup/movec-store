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
import type { PaginationQuery } from '../common/pagination';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findMyOrders(@Req() req: Request, @Query() query: PaginationQuery) {
    const user = req.user as any;
    return this.ordersService.findByCustomer(user.id, query);
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