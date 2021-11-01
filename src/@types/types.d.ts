declare module 'nodemailer-express-handlebars';

declare namespace Express {
  export interface Request {
    clientId: number;
  }
}