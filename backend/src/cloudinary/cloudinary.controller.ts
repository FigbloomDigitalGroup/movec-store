import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import { isAllowedImageBuffer } from '../common/file-signature';

@Controller('cloudinary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      // Rejecting via `cb(null, false)` instead of `cb(new Error(...), false)` --
      // an Error thrown from inside multer's fileFilter isn't caught by Nest's
      // exception filters the way a MulterError (e.g. the fileSize limit above)
      // is, so it surfaced as a raw 500 instead of a clean 400. `file` comes
      // back undefined to the handler below, which already checks for that.
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        cb(null, allowedMimes.includes(file.mimetype));
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!isAllowedImageBuffer(file.buffer)) {
      throw new BadRequestException(
        'File content does not match an allowed image format',
      );
    }

    const result = await this.cloudinaryService.uploadImage(file);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }
}
