import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, InstallationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateInstallationRequestDto } from './dto/create-installation-request.dto';
import { UpdateInstallationRequestDto } from './dto/update-installation-request.dto';
import { QueryInstallationRequestDto } from './dto/query-installation-request.dto';
import { buildPagination, paginated } from '../common/pagination';

// Mirrors frontend/src/lib/installationTimeSlots.ts so email copy matches the booking form.
const TIME_SLOT_LABELS: Record<string, string> = {
  MORNING: 'Morning (9am – 11am)',
  MIDDAY: 'Midday (11am – 1pm)',
  AFTERNOON: 'Afternoon (1pm – 3pm)',
  EVENING: 'Evening (3pm – 5pm)',
};

@Injectable()
export class InstallationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getServices() {
    return this.prisma.installationService.findMany({
      where: { isActive: true },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.installationRequest.findMany({
      where: { userId },
      include: {
        service: true,
        address: true,
        technicianAssignment: {
          include: {
            technician: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, phone: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(userId: string, dto: CreateInstallationRequestDto) {
    const service = await this.prisma.installationService.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service || !service.isActive)
      throw new NotFoundException('Service not found');

    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const request = await this.prisma.installationRequest.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        preferredDate: new Date(dto.preferredDate),
        timeSlot: dto.timeSlot,
        notes: dto.notes,
        addressId: dto.addressId,
        finalPrice: service.basePrice.toNumber(),
      },
      include: { service: true, address: true },
    });

    const customerName = `${user.firstName} ${user.lastName}`;
    const emailAddress = {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };
    const timeSlotLabel = dto.timeSlot
      ? TIME_SLOT_LABELS[dto.timeSlot]
      : undefined;

    await Promise.all([
      this.emailService.sendInstallationRequestConfirmation({
        toEmail: user.email,
        toName: customerName,
        serviceName: service.name,
        preferredDate: request.preferredDate,
        timeSlotLabel,
        address: emailAddress,
        notes: dto.notes,
        price: service.basePrice.toNumber(),
      }),
      this.emailService.sendInstallationRequestNotification({
        customerName,
        customerEmail: user.email,
        customerPhone: user.phone,
        serviceName: service.name,
        preferredDate: request.preferredDate,
        timeSlotLabel,
        address: emailAddress,
        notes: dto.notes,
        price: service.basePrice.toNumber(),
      }),
    ]);

    return request;
  }

  async getAllRequests(query: QueryInstallationRequestDto) {
    const { page, limit, skip } = buildPagination(query);
    const where: Prisma.InstallationRequestWhereInput = {};
    if (query.status) where.status = query.status as InstallationStatus;
    if (query.search) {
      where.OR = [
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { service: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.installationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          service: true,
          address: true,
          technicianAssignment: {
            include: {
              technician: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.installationRequest.count({ where }),
    ]);

    return paginated(data, total, page, limit);
  }

  async updateRequest(requestId: string, dto: UpdateInstallationRequestDto) {
    const request = await this.prisma.installationRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Installation request not found');

    const data: Prisma.InstallationRequestUpdateInput = {};

    if (dto.status) data.status = dto.status;
    if (dto.finalPrice !== undefined) data.finalPrice = dto.finalPrice;
    if (dto.preferredDate) data.preferredDate = new Date(dto.preferredDate);
    if (dto.timeSlot) data.timeSlot = dto.timeSlot;

    await this.prisma.installationRequest.update({
      where: { id: requestId },
      data,
    });

    if (dto.technicianId) {
      const technician = await this.prisma.technician.findUnique({
        where: { id: dto.technicianId },
      });
      if (!technician) throw new NotFoundException('Technician not found');

      await this.prisma.technicianAssignment.upsert({
        where: { requestId },
        create: {
          requestId,
          technicianId: dto.technicianId,
          assignedAt: new Date(),
        },
        update: {
          technicianId: dto.technicianId,
          assignedAt: new Date(),
        },
      });
    }

    if (dto.status === 'COMPLETED') {
      await this.prisma.technicianAssignment.update({
        where: { requestId },
        data: { completedAt: new Date() },
      });
    }

    return this.prisma.installationRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        service: true,
        address: true,
        technicianAssignment: {
          include: {
            technician: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  }

  async getTechnicians() {
    return this.prisma.technician.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async createTechnician(userId: string, specialization?: string) {
    const existing = await this.prisma.technician.findUnique({
      where: { userId },
    });
    if (existing) throw new BadRequestException('User is already a technician');

    return this.prisma.technician.create({
      data: { userId, specialization },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}
