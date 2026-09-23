import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import { isAllowedImageBuffer } from '../common/file-signature';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAllAdmin(query);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10,
      },
      // Rejecting via `cb(null, false)` instead of `cb(new Error(...), false)` --
      // an Error thrown from inside multer's fileFilter isn't caught by Nest's
      // exception filters the way a MulterError (e.g. the fileSize limit above)
      // is, so it surfaced as a raw 500 instead of a clean 400. With
      // FilesInterceptor, a rejected file is just dropped from the array rather
      // than leaving it undefined, so the handler below now also guards against
      // an empty array (every file rejected) silently "succeeding" with nothing
      // uploaded.
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
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No valid image files provided');
    }
    for (const file of files) {
      if (!isAllowedImageBuffer(file.buffer)) {
        throw new BadRequestException(
          `File content of "${file.originalname}" does not match an allowed image format`,
        );
      }
    }
    return this.productsService.uploadImages(id, files);
  }

  @Delete('images/:imageId')
  deleteImage(@Param('imageId') imageId: string) {
    return this.productsService.deleteImage(imageId);
  }
}
