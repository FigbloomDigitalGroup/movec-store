import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('admin/support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  getAllTickets(@Query() query: QueryTicketDto) {
    return this.supportService.getAllTickets(query);
  }

  @Get('tickets/:id')
  getTicket(@Param('id') id: string) {
    return this.supportService.getTicket(id);
  }

  @Patch('tickets/:id')
  updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.supportService.updateTicketStatus(id, body.status);
  }

  @Post('tickets/:id/messages')
  replyToTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.supportService.addMessage(id, user.id, true, dto);
  }

  @Post('faqs')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.supportService.createFaq(dto);
  }

  @Patch('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: CreateFaqDto) {
    return this.supportService.updateFaq(id, dto);
  }

  @Delete('faqs/:id')
  deleteFaq(@Param('id') id: string) {
    return this.supportService.deleteFaq(id);
  }
}
