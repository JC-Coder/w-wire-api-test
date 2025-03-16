import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENVIRONMENT_VARIABLES } from '../../common/configs/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: ENVIRONMENT_VARIABLES.TEST_DB_URL,
      autoLoadEntities: true,
      synchronize: true, // Always synchronize test database
      dropSchema: true, // Drop the schema before each test run
      logging: false, // Disable logging for tests
    }),
  ],
})
export class DatabaseTestModule {}
