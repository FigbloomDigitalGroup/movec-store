import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinaryLib } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('Cloudinary') private cloudinary: typeof cloudinaryLib) {}

  async uploadImage(file: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}