import crypto from 'crypto';
import dayjs from 'dayjs';

import connection from '../database/connection';

export default {
  async generateRefreshToken(cliente_id: string) {
    const espira_em = dayjs().add(15, 'second').unix();

    const id = crypto.randomBytes(15).toString('hex');

    await connection('refresh_token').insert({
      id,
      espira_em,
      cliente_id,
    });

    const dados = {
      id,
      espira_em,
      cliente_id,
    };

    return dados;
  },
};
