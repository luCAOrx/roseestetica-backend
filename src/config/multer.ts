import aws from 'aws-sdk';
import crypto from 'crypto';
import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

const doisMB = 2 * 1024 * 1024;

const tiposArmazenados = {
  local: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename(request, file: Express.MulterS3.File, callback) {
      const hash = crypto.randomBytes(6).toString('hex');

      file.key = `${hash}-${file.originalname}`;

      callback(null, file.key);
    },
  }),
  s3: multerS3({
    s3: new aws.S3(),
    bucket: 'roseestetica-upload',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (request, file: Express.MulterS3.File, callback) => {
      const hash = crypto.randomBytes(6).toString('hex');

      const fileName = `${hash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
};

export default {
  destination: path.resolve(__dirname, '..', '..', 'uploads'),
  storage: process.env.STORAGE_TYPE === 'local' ? tiposArmazenados.local : tiposArmazenados.s3,
  limits: {
    fileSize: doisMB,
  },

  fileFilter(request: Request, file: Express.Multer.File, callback: FileFilterCallback) {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/jpg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(new Error('Tipo de arquivo inválido.'));
    }
  },
};
