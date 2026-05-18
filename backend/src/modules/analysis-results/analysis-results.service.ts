import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisOutput } from '../groq/groq.schema';
import { AnalysisResult } from './analysis-result.entity';

@Injectable()
export class AnalysisResultsService {
  constructor(
    @InjectRepository(AnalysisResult)
    private readonly resultsRepo: Repository<AnalysisResult>,
  ) {}

  async create(decisionId: string, analysis: AnalysisOutput) {
    const result = this.resultsRepo.create({
      decisionId,
      options: analysis.options,
      criteria: analysis.criteria,
      scores: analysis.scores,
      tradeoffs: analysis.tradeoffs,
      risks: analysis.risks,
      simulation: analysis.simulation,
      recommendation: analysis.recommendation,
      confidenceScore: analysis.recommendation.confidence,
    });

    return this.resultsRepo.save(result);
  }
}
