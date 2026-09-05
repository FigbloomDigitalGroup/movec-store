import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('faqs')
  getFaqs() {
    return this.supportService.getFaqs();
  }

  @Post('contact')
  submitContactForm(@Body() dto: CreateContactDto) {
    return this.supportService.submitContactForm(dto);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  getMyTickets(@CurrentUser() user: AuthenticatedUser) {
    return this.supportService.getMyTickets(user.id);
  }

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  createTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(user.id, dto);
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard)
  getTicket(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.supportService.getTicket(id, user.id);
  }

  @Post('tickets/:id/messages')
  @UseGuards(JwtAuthGuard)
  addMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.supportService.addMessage(id, user.id, false, dto);
  }
}
