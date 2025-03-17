import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { LoggedInUserDecorator } from '../../common/decorators/logged-in-user.decorator';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { User } from '../database/entities/user.entity';

@Controller('user/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ResponseMessage('Transactions retrieved successfully')
  async getUserTransactions(@LoggedInUserDecorator() user: User) {
    return this.transactionsService.getUserTransactions(user.id);
  }
}
