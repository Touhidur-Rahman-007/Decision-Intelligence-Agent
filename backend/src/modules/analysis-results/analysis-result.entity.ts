import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Decision } from '../decisions/decision.entity';

@Entity('analysis_results')
export class AnalysisResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Decision, (decision) => decision.result, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'decision_id' })
  decision: Decision;

  @Column({ name: 'decision_id' })
  decisionId: string;

  @Column({ type: 'jsonb' })
  options: string[];

  @Column({ type: 'jsonb' })
  criteria: string[];

  @Column({ type: 'jsonb' })
  scores: Record<string, Record<string, number>>;

  @Column({ type: 'jsonb' })
  tradeoffs: Array<{ option: string; gains: string; loses: string }>;

  @Column({ type: 'jsonb' })
  risks: Record<string, { level: string; score: number; reasons: string[] }>;

  @Column({ type: 'jsonb' })
  simulation: Record<string, { best: string; average: string; worst: string }>;

  @Column({ type: 'jsonb' })
  recommendation: {
    best: string;
    alternative: string;
    avoid: string;
    reasoning: string;
    confidence: number;
  };

  @Column({ name: 'confidence_score', type: 'float' })
  confidenceScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
