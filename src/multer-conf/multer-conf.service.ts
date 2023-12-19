import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: './upload',
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(csv|vnd.*|xls)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Not allowed'), false);
        }
      },

      // save file with original name
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          return cb(null, `${file.originalname}`);
        },
      }),
    };
  }
}