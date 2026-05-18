import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { analysisSchema, AnalysisOutput } from './groq.schema';

@Injectable()
export class GroqService {
  constructor(
    private readonly config: ConfigService,
  ) {}

  async analyzeDecision(scenario: string): Promise<AnalysisOutput> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Groq API key not configured');
    }

    const timeoutMs = this.config.get<number>('GROQ_TIMEOUT_MS') ?? 60000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.get<string>('GROQ_MODEL') ??
              'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: this.buildPrompt(scenario),
              },
            ],
            temperature: 0.2,
          }),
          signal: controller.signal,
        },
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('Groq request timed out');
      }
      throw new ServiceUnavailableException('Groq request failed');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let message = `Groq request failed (${response.status})`;
      try {
        const payload = await response.json();
        message = payload?.error?.message ?? payload?.message ?? message;
      } catch {
        try {
          message = await response.text();
        } catch {
          // keep fallback message
        }
      }
      throw new BadRequestException(message);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    const json = this.extractJson(content);
    const parsed = analysisSchema.safeParse(json);

    if (!parsed.success) {
      throw new BadRequestException('Groq response did not match schema');
    }

    return parsed.data;
  }

  private buildPrompt(scenario: string): string {
    return `You are an expert decision analysis system. Your job is to perform a complete, multi-dimensional analysis of a decision scenario.\n\nDecision Scenario: "${scenario}"\n\nPerform the following analysis autonomously:\n1. Identify all options present in the scenario\n2. Determine the most relevant evaluation criteria for this specific type of decision\n3. Score each option on each criteria from 1 to 10\n4. Identify the most important trade-offs between options\n5. Estimate risk level and specific risk factors for each option\n6. Simulate best case, average case, and worst case outcomes for each option\n7. Generate a final recommendation with full reasoning and confidence score\n\nReturn ONLY a valid JSON object with no text outside the JSON. Do not include analysis notes or chain-of-thought. Use exactly this structure:\n\n{\n  "options": ["string"],\n  "criteria": ["string"],\n  "scores": {\n    "optionName": { "criteriaName": 1-10 }\n  },\n  "tradeoffs": [\n    { "option": "string", "gains": "string", "loses": "string" }\n  ],\n  "risks": {\n    "optionName": { "level": "Low|Medium|High", "score": 1-10, "reasons": ["string"] }\n  },\n  "simulation": {\n    "optionName": {\n      "best": "string",\n      "average": "string",\n      "worst": "string"\n    }\n  },\n  "recommendation": {\n    "best": "string",\n    "alternative": "string",\n    "avoid": "string",\n    "reasoning": "string",\n    "confidence": 0-100\n  }\n}`;
  }

  private extractJson(content: string) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new BadRequestException('Groq response did not include JSON');
    }
    const raw = content.slice(start, end + 1);
    try {
      return JSON.parse(raw);
    } catch {
      throw new BadRequestException('Groq response was not valid JSON');
    }
  }
}
