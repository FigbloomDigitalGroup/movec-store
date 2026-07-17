import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as any;
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
uploadAvatar(@Req() req: Request, @UploadedFile() file: any) {
    const user = req.user as any;
    return this.usersService.uploadAvatar(user.id, file);
  }

  @Get('me/addresses')
  getAddresses(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.getAddresses(user.id);
  }

  @Post('me/addresses')
  createAddress(@Req() req: Request, @Body() dto: CreateAddressDto) {
    const user = req.user as any;
    return this.usersService.createAddress(user.id, dto);
  }

  @Patch('me/addresses/:id')
  updateAddress(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    const user = req.user as any;
    return this.usersService.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddress(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.usersService.deleteAddress(user.id, id);
  }
}