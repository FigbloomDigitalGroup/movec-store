import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('faqs')
  getFaqs() {
    return this.supportService.getFaqs();
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  getMyTickets(@Req() req: Request) {
    const user = req.user as any;
    return this.supportService.getMyTickets(user.id);
  }

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  createTicket(@Req() req: Request, @Body() dto: CreateTicketDto) {
    const user = req.user as any;
    return this.supportService.createTicket(user.id, dto);
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard)
  getTicket(@Param('id') id: string) {
    return this.supportService.getTicket(id);
  }

  @Post('tickets/:id/messages')
  @UseGuards(JwtAuthGuard)
  addMessage(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateMessageDto) {
    const user = req.user as any;
    return this.supportService.addMessage(id, user.id, false, dto);
  }
}