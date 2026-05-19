import { z } from 'zod';

export const analysisSchema = z.object({
  options: z.array(z.string().min(1)),
  criteria: z.array(z.string().min(1)),
  scores: z.record(z.record(z.number().min(1).max(10))),
  tradeoffs: z.array(
    z.object({
      option: z.string(),
      gains: z.string(),
      loses: z.string(),
    }),
  ),
  risks: z.record(
    z.object({
      level: z.enum(['Low', 'Medium', 'High']),
      score: z.number().min(1).max(10),
      reasons: z.array(z.string()),
    }),
  ),
  simulation: z.record(
    z.object({
      best: z.string(),
      average: z.string(),
      worst: z.string(),
    }),
  ),
  recommendation: z.object({
    best: z.string(),
    alternative: z.string(),
    avoid: z.string(),
    reasoning: z.string(),
    confidence: z.number().min(0).max(100),
  }),
});

export const intakeSchema = z
  .object({
    done: z.boolean(),
    question: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    focus: z.string().min(1).optional(),
  })
  .refine(
    (value) => (value.done ? Boolean(value.summary) : Boolean(value.question)),
    {
      message: 'Intake response must include question or summary',
    },
  );

export type AnalysisOutput = z.infer<typeof analysisSchema>;
export type IntakeOutput = z.infer<typeof intakeSchema>;
