import nodemailer from 'nodemailer';
import handlebars from 'nodemailer-express-handlebars';

import path from 'path';

import mailConfig from '../config/mail';

const { host, port, secure, user, pass, ciphers } = mailConfig;

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass
  },
  tls: {
    ciphers
  }
});

const handlebarOptions = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/resources/mail/auth/'),
    layoutsDir: path.resolve('./src/resources/mail/auth/'),
    defaultLayout: 'esqueci_minha_senha.html',
  },
  viewPath: path.resolve('./src/resources/mail/auth/'),
  extName: '.html',
};

transport.use('compile', handlebars(handlebarOptions));

export default transport;