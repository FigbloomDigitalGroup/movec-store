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
import { memoryStorage } from 'multer';
import type { Request } from 'express';

const AVATAR_ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (AVATAR_ALLOWED_MIMES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
        }
      },
    }),
  )
  uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
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