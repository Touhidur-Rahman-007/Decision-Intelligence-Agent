import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@RequestUser() user: { id: string }) {
    const profile = await this.usersService.findById(user.id);
    return profile ? this.usersService.toSafeUser(profile) : null;
  }
}
