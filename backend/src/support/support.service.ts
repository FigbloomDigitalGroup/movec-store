import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getFaqs() {
    return this.prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  async createFaq(dto: CreateFaqDto) {
    return this.prisma.fAQ.create({ data: dto });
  }

  async updateFaq(id: string, dto: CreateFaqDto) {
    return this.prisma.fAQ.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: string) {
    await this.prisma.fAQ.delete({ where: { id } });
    return { message: 'FAQ deleted' };
  }

  async getMyTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTicket(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        priority: dto.priority || 'MEDIUM',
        messages: {
          create: {
            senderId: userId,
            message: dto.message,
            isStaffReply: false,
          },
        },
      },
      include: { messages: true },
    });

    return ticket;
  }

  // `ownerId` is only passed by the customer-facing controller, to enforce that a
  // customer can only view their own ticket. The admin controller omits it, since
  // access there is already gated by RolesGuard + @Roles(ADMIN).
  async getTicket(ticketId: string, ownerId?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { firstName: true, lastName: true } } } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ownerId && ticket.userId !== ownerId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    return ticket;
  }

  async addMessage(ticketId: string, senderId: string, isStaff: boolean, dto: CreateMessageDto) {
    if (!isStaff) {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        select: { userId: true },
      });
      if (!ticket) throw new NotFoundException('Ticket not found');
      if (ticket.userId !== senderId) {
        throw new ForbiddenException('You do not have access to this ticket');
      }
    }
    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message: dto.message,
        isStaffReply: isStaff,
      },
    });
  }

  async getAllTickets(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as any },
    });
  }

  async submitContactForm(dto: CreateContactDto) {
    if (dto.website) {
      return { success: true };
    }

    await this.emailService.sendContactFormEmail({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      subject: dto.subject,
      message: dto.message,
    });

    await this.emailService.sendContactFormConfirmation(dto.email, dto.name);

    return { success: true };
  }
}