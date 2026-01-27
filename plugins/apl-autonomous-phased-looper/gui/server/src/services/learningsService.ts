// Learnings Service - manages APL learnings
import type { Learnings, SuccessPattern, AntiPattern } from '@apl-gui/shared';
import { DEFAULT_LEARNINGS } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fileUtils.js';

export class LearningsService {
  async getLearnings(): Promise<Learnings> {
    const learnings = await readJsonFile<Learnings>(config.learningsFilePath);
    return learnings || DEFAULT_LEARNINGS;
  }

  async hasLearnings(): Promise<boolean> {
    return fileExists(config.learningsFilePath);
  }

  async getSuccessPatterns(): Promise<SuccessPattern[]> {
    const learnings = await this.getLearnings();
    return learnings.success_patterns || [];
  }

  async getAntiPatterns(): Promise<AntiPattern[]> {
    const learnings = await this.getLearnings();
    return learnings.anti_patterns || [];
  }

  async getPatternById(id: string): Promise<SuccessPattern | AntiPattern | null> {
    const learnings = await this.getLearnings();

    const successPattern = learnings.success_patterns.find(p => p.id === id);
    if (successPattern) return successPattern;

    const antiPattern = learnings.anti_patterns.find(p => p.id === id);
    return antiPattern || null;
  }

  async deletePattern(id: string): Promise<boolean> {
    const learnings = await this.getLearnings();

    const successIndex = learnings.success_patterns.findIndex(p => p.id === id);
    if (successIndex !== -1) {
      learnings.success_patterns.splice(successIndex, 1);
      learnings.last_updated = new Date().toISOString();
      return writeJsonFile(config.learningsFilePath, learnings);
    }

    const antiIndex = learnings.anti_patterns.findIndex(p => p.id === id);
    if (antiIndex !== -1) {
      learnings.anti_patterns.splice(antiIndex, 1);
      learnings.last_updated = new Date().toISOString();
      return writeJsonFile(config.learningsFilePath, learnings);
    }

    return false;
  }

  async clearAllPatterns(): Promise<boolean> {
    const learnings = await this.getLearnings();
    learnings.success_patterns = [];
    learnings.anti_patterns = [];
    learnings.last_updated = new Date().toISOString();
    return writeJsonFile(config.learningsFilePath, learnings);
  }

  async getUserPreferences(): Promise<Learnings['user_preferences']> {
    const learnings = await this.getLearnings();
    return learnings.user_preferences;
  }

  async getProjectKnowledge(): Promise<Learnings['project_knowledge']> {
    const learnings = await this.getLearnings();
    return learnings.project_knowledge;
  }

  async getTechniqueStats(): Promise<Learnings['technique_stats']> {
    const learnings = await this.getLearnings();
    return learnings.technique_stats;
  }

  async getPatternsByTag(tag: string): Promise<SuccessPattern[]> {
    const learnings = await this.getLearnings();
    return learnings.success_patterns.filter(p => p.tags.includes(tag));
  }

  async getPatternsByTaskType(taskType: string): Promise<(SuccessPattern | AntiPattern)[]> {
    const learnings = await this.getLearnings();
    const results: (SuccessPattern | AntiPattern)[] = [];

    results.push(...learnings.success_patterns.filter(p => p.task_type === taskType));
    results.push(...learnings.anti_patterns.filter(p => p.task_type === taskType));

    return results;
  }

  async getStats(): Promise<{
    successPatternCount: number;
    antiPatternCount: number;
    totalPatterns: number;
    topTags: { tag: string; count: number }[];
  }> {
    const learnings = await this.getLearnings();

    const tagCounts: Record<string, number> = {};
    for (const pattern of learnings.success_patterns) {
      for (const tag of pattern.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      successPatternCount: learnings.success_patterns.length,
      antiPatternCount: learnings.anti_patterns.length,
      totalPatterns: learnings.success_patterns.length + learnings.anti_patterns.length,
      topTags,
    };
  }
}

export const learningsService = new LearningsService();
