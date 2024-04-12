// typesense.config.ts

import { Injectable } from '@nestjs/common';
import { Client } from 'typesense';

@Injectable()
export class TypesenseConfig {
  async createSchema() {
    const client = this.getClient();

    try {
      await client.collections('users').delete();
    } catch (error) {
      console.log();
    }

    await client.collections().create({
      name: 'users',
      fields: [
        {
          name: 'id',
          type: 'int32',
          facet: false,
        },
        {
          name: 'userName',
          type: 'string',
          facet: false,
        },
        {
          name: 'fullName',
          type: 'string',
          facet: false,
        },
        {
          name: 'avatar',
          type: 'string',
          facet: false,
          optional: true,
        },
      ],
    });
  }

  getClient(): Client {
    let client = new Client({
      apiKey: 'xyz',
      nodes: [
        {
          host: 'localhost',
          port: 8108,
          protocol: 'http',
        },
      ],
    });

    return client;
  }
}
