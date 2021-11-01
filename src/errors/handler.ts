import { ErrorRequestHandler } from "express";

import fileSystem from 'fs';

import path from 'path';

import multer from "multer";

import { ValidationError } from "yup";

import aws from 'aws-sdk';

import { promisify } from 'util';

interface ValidationErrors {
  [key: string]: string[];
};

const s3 = new aws.S3();

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if(error instanceof ValidationError) {
    let errors: ValidationErrors = {}

    error.inner.forEach(err => {
      errors[`${err.path}`] = err.errors;
    });

    const { key: imagem } = request.file as Express.MulterS3.File;

    process.env.STORAGE_TYPE === 'local' ?

    promisify(fileSystem.unlink)(path.resolve(
      __dirname, '..', '..', `uploads/${imagem}`
    )) :

    s3.deleteObject({
      Bucket: 'roseestetica-upload',
      Key: imagem
    }).promise();

    console.log(errors);

    return response.status(400).json({ message: 'Validation fails', errors })
  };

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const message = error.message = 'O arquivo não pode ter mais que 2mb.'

      const { key: imagem } = request.file as Express.MulterS3.File;

      process.env.STORAGE_TYPE === 'local' ?

      promisify(fileSystem.unlink)(path.resolve(
        __dirname, '..', '..', `uploads/${imagem}`
      )) :

      s3.deleteObject({
        Bucket: 'roseestetica-upload',
        Key: imagem
      }).promise();

      return response.status(400).json({ message: message });
    };
  };

  console.log(error);
  return response.status(500).json({ message: 'Internal server error' });
}

export default errorHandler;