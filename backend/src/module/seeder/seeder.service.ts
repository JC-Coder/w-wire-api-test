import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { BaseHelper } from '../../common/utils/helper/helper.util';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  async seedUsers() {
    const userData = [
      {
        username: 'user1',
        password: 'Password',
      },
      {
        username: 'user2',
        password: 'Password',
      },
      {
        username: 'user3',
        password: 'Password',
      },
    ];

    for (const user of userData) {
      const existingUser = await this.userRepository.findOne({
        where: { username: user.username },
      });
      if (!existingUser) {
        await this.userRepository.save(
          this.userRepository.create({
            username: user.username,
            password: await BaseHelper.hashData(user.password),
          }),
        );
      }
    }
  }
}
