export type UserRole = 'user' | 'admin';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type DecisionSummary = {
  id: string;
  scenarioText: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
};

export type AnalysisResult = {
  options: string[];
  criteria: string[];
  scores: Record<string, Record<string, number>>;
  tradeoffs: Array<{ option: string; gains: string; loses: string }>;
  risks: Record<
    string,
    { level: 'Low' | 'Medium' | 'High'; score: number; reasons: string[] }
  >;
  simulation: Record<string, { best: string; average: string; worst: string }>;
  recommendation: {
    best: string;
    alternative: string;
    avoid: string;
    reasoning: string;
    confidence: number;
  };
};

export type DecisionDetail = DecisionSummary & {
  result?: AnalysisResult;
};
