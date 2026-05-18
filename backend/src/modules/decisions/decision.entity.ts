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
