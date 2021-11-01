import { sign } from 'jsonwebtoken';

import authConfig from '../config/auth';

export default {
  async generateToken(params: {}) {
    return sign(params, authConfig.secret, {
      expiresIn: '20s'
    });
  }
};
