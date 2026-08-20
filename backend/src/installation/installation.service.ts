import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, InstallationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstallationRequestDto } from './dto/create-installation-request.dto';
import { UpdateInstallationRequestDto } from './dto/update-installation-request.dto';
import { QueryInstallationRequestDto } from './dto/query-installation-request.dto';
import { buildPagination, paginated } from '../common/pagination';

@Injectable()
export class InstallationService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.installationRequest.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        preferredDate: new Date(dto.preferredDate),
        notes: dto.notes,
        addressId: dto.addressId,
        finalPrice: service.basePrice.toNumber(),
      },
      include: { service: true, address: true },
    });
  }

  async getAllRequests(query: QueryInstallationRequestDto) {
    const { page, limit, skip } = buildPagination(query);
    const where: Prisma.InstallationRequestWhereInput = {};
    if (query.status) where.status = query.status as InstallationStatus;

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
