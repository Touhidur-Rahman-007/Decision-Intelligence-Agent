import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { DecisionsService } from './decisions.service';

@Controller('decisions')
@UseGuards(JwtAuthGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Get()
  listDecisions(@RequestUser() user: { id: string }) {
    return this.decisionsService.listForUser(user.id);
  }

  @Post()
  createDecision(
    @RequestUser() user: { id: string },
    @Body() payload: CreateDecisionDto,
  ) {
    return this.decisionsService.createDecision(user.id, payload.scenarioText);
  }

  @Get(':id')
  getDecision(@RequestUser() user: { id: string }, @Param('id') id: string) {
    return this.decisionsService.getDecisionById(user.id, id);
  }

  @Delete(':id')
  deleteDecision(@RequestUser() user: { id: string }, @Param('id') id: string) {
    return this.decisionsService.deleteDecision(user.id, id);
  }
}
