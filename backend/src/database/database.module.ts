import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENVIRONMENT_VARIABLES } from '../common/configs/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: ENVIRONMENT_VARIABLES.DB_URL,
      autoLoadEntities: true,
      synchronize: ENVIRONMENT_VARIABLES.APP_ENV !== 'production',
      logging: ENVIRONMENT_VARIABLES.APP_ENV !== 'production',
    }),
  ],
})
export class DatabaseModule {}
