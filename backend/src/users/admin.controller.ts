import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import { IsArray, IsEnum } from 'class-validator';
import type { PaginationQuery } from '../common/pagination';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

class AssignRolesDto {
  @IsArray()
  @IsEnum(RoleName, { each: true })
  roles: RoleName[];
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: PaginationQuery, @Query('search') search?: string) {
    return this.usersService.findAll(query, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto, admin.id);
  }

  @Delete(':id')
  remove(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.softDelete(id, admin.id);
  }

  @Patch(':id/roles')
  assignRoles(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.update(id, { roles: dto.roles }, admin.id);
  }
}
