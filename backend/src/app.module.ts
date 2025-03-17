import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { CurrencyModule } from './module/currency/currency.module';
import { DatabaseModule } from './module/database/database.module';
import { UserModule } from './module/user/user.module';
import { SeederModule } from './module/seeder/seeder.module';
import { TransactionsModule } from './module/transactions/transactions.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    CurrencyModule,
    SeederModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
