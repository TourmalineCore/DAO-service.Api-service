import { Module } from '@nestjs/common';
import { postgresProviders } from './postgres.providers';

@Module({
  providers: [...postgresProviders],
  exports: [...postgresProviders],
})
export class PostgresModule {}
