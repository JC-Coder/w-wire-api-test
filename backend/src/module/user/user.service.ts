import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { BaseHelper } from '../../common/utils/helper/helper.util';
import { AppError } from '../../common/filter/app-error.filter';
import { ERROR_CODES } from '../../common/constants/error-codes.constant';

@Injectable()
export class UserService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );
      throw new AppError(
        `Account is locked. Please try again in ${remainingTime} minutes`,
        HttpStatus.TOO_MANY_REQUESTS,
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }

    // Update last login attempt
    user.lastLoginAttempt = new Date();

    const isPasswordValid = await BaseHelper.compareHashedData(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      // Check if we should lock the account
      if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
      }

      await this.userRepository.save(user);
      return null;
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);

    return user;
  }
}
