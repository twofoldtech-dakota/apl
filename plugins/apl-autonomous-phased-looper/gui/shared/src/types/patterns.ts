// APL Pattern Library Types - based on patterns/*.json structure

export type PatternCategory = 'authentication' | 'api' | 'database' | 'testing' | 'react';

export interface CodeExample {
  title: string;
  language: string;
  code: string;
  description?: string;
}

export interface Pattern {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  applicable_when: string[];
  approach: string;
  code_examples: {
    basic: CodeExample;
    advanced?: CodeExample;
  };
  success_indicators: string[];
  pitfalls: string[];
  related_patterns: string[];
  tags: string[];
}

export interface PatternFile {
  $schema?: string;
  version: string;
  patterns: Pattern[];
}

export interface PatternIndex {
  categories: {
    [key in PatternCategory]?: {
      name: string;
      description: string;
      pattern_count: number;
    };
  };
  total_patterns: number;
  patterns_by_category: {
    [key in PatternCategory]?: Pattern[];
  };
}
