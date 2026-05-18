import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisResultsService } from '../analysis-results/analysis-results.service';
import { GroqService } from '../groq/groq.service';
import { DecisionStatus } from './decision-status.enum';
import { Decision } from './decision.entity';

@Injectable()
export class DecisionsService {
  constructor(
    @InjectRepository(Decision)
    private readonly decisionsRepo: Repository<Decision>,
    private readonly groqService: GroqService,
    private readonly analysisResultsService: AnalysisResultsService,
  ) {}

  async createDecision(userId: string, scenarioText: string) {
    const scenario = scenarioText.trim();
    if (!scenario) {
      throw new BadRequestException('Scenario text is required');
    }

    const decision = this.decisionsRepo.create({
      userId,
      scenarioText: scenario,
      status: DecisionStatus.Pending,
    });
    await this.decisionsRepo.save(decision);

    try {
      const analysis = await this.groqService.analyzeDecision(scenarioText);
      const result = await this.analysisResultsService.create(
        decision.id,
        analysis,
      );

      decision.status = DecisionStatus.Completed;
      decision.result = result;
      await this.decisionsRepo.save(decision);

      return this.decisionsRepo.findOne({
        where: { id: decision.id, userId },
        relations: { result: true },
      });
    } catch (error) {
      await this.decisionsRepo.update(
        { id: decision.id },
        { status: DecisionStatus.Failed },
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Decision analysis failed');
    }
  }

  async listForUser(userId: string) {
    return this.decisionsRepo.find({
      where: { userId },
      select: {
        id: true,
        scenarioText: true,
        status: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async listAll() {
    return this.decisionsRepo.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getDecisionById(userId: string, id: string) {
    const decision = await this.decisionsRepo.findOne({
      where: { id, userId },
      relations: { result: true },
    });
    if (!decision) {
      throw new NotFoundException('Decision not found');
    }
    return decision;
  }

  async deleteDecision(userId: string, id: string) {
    const decision = await this.decisionsRepo.findOne({
      where: { id, userId },
    });
    if (!decision) {
      throw new NotFoundException('Decision not found');
    }
    await this.decisionsRepo.delete({ id, userId });
    return { deleted: true };
  }
}
