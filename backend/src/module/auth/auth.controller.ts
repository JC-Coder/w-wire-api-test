import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ILoginResponse } from '../../common/types/auth.types';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ResponseMessage('Login successful')
  async login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    return this.authService.login(loginDto);
  }
}
