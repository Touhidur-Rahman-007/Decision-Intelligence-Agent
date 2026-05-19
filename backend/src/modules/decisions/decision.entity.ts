import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnalysisResult } from '../analysis-results/analysis-result.entity';
import { User } from '../users/user.entity';
import { DecisionStatus } from './decision-status.enum';

@Entity('decisions')
export class Decision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.decisions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'scenario_text', type: 'text' })
  scenarioText: string;

  @Column({ name: 'intake_history', type: 'jsonb', default: () => "'[]'::jsonb" })
  intakeHistory: Array<{ question: string; answer: string }>;

  @Column({ name: 'intake_last_question', type: 'text', nullable: true })
  intakeLastQuestion: string | null;

  @Column({ name: 'intake_summary', type: 'text', nullable: true })
  intakeSummary: string | null;

  @Column({ name: 'intake_complete', type: 'boolean', default: false })
  intakeComplete: boolean;

  @Column({
    type: 'enum',
    enum: DecisionStatus,
    default: DecisionStatus.Pending,
  })
  status: DecisionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => AnalysisResult, (result) => result.decision)
  result: AnalysisResult;
}
