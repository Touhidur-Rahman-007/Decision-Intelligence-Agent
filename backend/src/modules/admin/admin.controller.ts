import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/role.enum';
import { DecisionsService } from '../decisions/decisions.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly decisionsService: DecisionsService,
  ) {}

  @Get('users')
  async listUsers() {
    const users = await this.usersService.listAll();
    return users.map((user) => this.usersService.toSafeUser(user));
  }

  @Get('decisions')
  async listDecisions() {
    const decisions = await this.decisionsService.listAll();
    return decisions.map((decision) => ({
      id: decision.id,
      scenarioText: decision.scenarioText,
      status: decision.status,
      createdAt: decision.createdAt,
      user: decision.user ? this.usersService.toSafeUser(decision.user) : null,
    }));
  }
}
