import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from './analysis-result.entity';
import { AnalysisResultsService } from './analysis-results.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisResult])],
  providers: [AnalysisResultsService],
  exports: [AnalysisResultsService],
})
export class AnalysisResultsModule {}
