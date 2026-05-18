import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResultsModule } from '../analysis-results/analysis-results.module';
import { GroqModule } from '../groq/groq.module';
import { Decision } from './decision.entity';
import { DecisionsController } from './decisions.controller';
import { DecisionsService } from './decisions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Decision]),
    GroqModule,
    AnalysisResultsModule,
  ],
  controllers: [DecisionsController],
  providers: [DecisionsService],
  exports: [DecisionsService],
})
export class DecisionsModule {}
