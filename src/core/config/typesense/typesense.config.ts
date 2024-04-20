// typesense.config.ts

import { Injectable } from '@nestjs/common';
import { Client } from 'typesense';
import { EnvironmentConfigService } from '../environment/environments';

@Injectable()
export class TypesenseConfig {
  constructor(private readonly environment: EnvironmentConfigService) {}

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
    const client = new Client({
      apiKey: this.environment.getTypesenseApiKey(),
      nodes: [
        {
          host: this.environment.getTypesenseHost(),
          port: this.environment.getTypesensePort(),
          protocol: 'http',
        },
      ],
    });

    return client;
  }
}
