import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENVIRONMENT_VARIABLES } from '../../common/configs/environment';
import { User } from './entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: ENVIRONMENT_VARIABLES.DB_URL,
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
