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

const MAX_INTAKE_QUESTIONS = 6;

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

  async startIntake(userId: string, scenarioText: string) {
    const scenario = scenarioText.trim();
    if (!scenario) {
      throw new BadRequestException('Scenario text is required');
    }

    const decision = this.decisionsRepo.create({
      userId,
      scenarioText: scenario,
      status: DecisionStatus.Pending,
      intakeHistory: [],
      intakeComplete: false,
      intakeLastQuestion: null,
      intakeSummary: null,
    });
    await this.decisionsRepo.save(decision);

    const intake = await this.groqService.getNextIntakeStep(scenario, []);
    if (intake.done) {
      return this.finalizeDecision(decision, intake.summary ?? null, []);
    }

    decision.intakeLastQuestion = intake.question ?? null;
    await this.decisionsRepo.save(decision);

    return {
      decisionId: decision.id,
      done: false,
      question: intake.question,
    };
  }

  async answerIntake(userId: string, decisionId: string, answer: string) {
    const decision = await this.decisionsRepo.findOne({
      where: { id: decisionId, userId },
    });
    if (!decision) {
      throw new NotFoundException('Decision not found');
    }
    if (decision.intakeComplete) {
      return { decisionId: decision.id, done: true };
    }

    const question = decision.intakeLastQuestion?.trim();
    if (!question) {
      throw new BadRequestException('No active intake question');
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      throw new BadRequestException('Answer is required');
    }

    const intakeHistory = [...(decision.intakeHistory ?? [])];
    intakeHistory.push({ question, answer: trimmedAnswer });
    decision.intakeHistory = intakeHistory;
    decision.intakeLastQuestion = null;

    if (intakeHistory.length >= MAX_INTAKE_QUESTIONS) {
      decision.intakeSummary = this.formatIntakeSummary(
        decision.scenarioText,
        intakeHistory,
      );
      return this.finalizeDecision(decision, decision.intakeSummary, intakeHistory);
    }

    const intake = await this.groqService.getNextIntakeStep(
      decision.scenarioText,
      intakeHistory,
    );

    if (intake.done) {
      decision.intakeSummary = intake.summary ?? this.formatIntakeSummary(
        decision.scenarioText,
        intakeHistory,
      );
      return this.finalizeDecision(decision, decision.intakeSummary, intakeHistory);
    }

    decision.intakeLastQuestion = intake.question ?? null;
    await this.decisionsRepo.save(decision);

    return {
      decisionId: decision.id,
      done: false,
      question: intake.question,
    };
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

  private async finalizeDecision(
    decision: Decision,
    intakeSummary: string | null,
    intakeHistory: Array<{ question: string; answer: string }>,
  ) {
    try {
      const analysis = await this.groqService.analyzeDecision(
        decision.scenarioText,
        intakeSummary,
        intakeHistory,
      );
      const result = await this.analysisResultsService.create(
        decision.id,
        analysis,
      );

      decision.status = DecisionStatus.Completed;
      decision.result = result;
      decision.intakeComplete = true;
      decision.intakeLastQuestion = null;
      decision.intakeSummary = intakeSummary;
      await this.decisionsRepo.save(decision);

      return { decisionId: decision.id, done: true };
    } catch (error) {
      decision.status = DecisionStatus.Failed;
      decision.intakeComplete = true;
      decision.intakeLastQuestion = null;
      await this.decisionsRepo.save(decision);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Decision analysis failed');
    }
  }

  private formatIntakeSummary(
    scenario: string,
    intakeHistory: Array<{ question: string; answer: string }>,
  ) {
    const formattedHistory = intakeHistory
      .map((entry, index) => `${index + 1}. ${entry.question} => ${entry.answer}`)
      .join(' | ');
    return `Scenario: ${scenario}. Clarifications: ${formattedHistory}`;
  }
}
