// Pattern Service - manages APL pattern library
import path from 'path';
import type { Pattern, PatternFile, PatternCategory, PatternIndex } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile, readDir, fileExists } from '../utils/fileUtils.js';

export class PatternService {
  private cache: Map<string, Pattern[]> = new Map();
  private lastCacheTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  async getPatternIndex(): Promise<PatternIndex> {
    const categories = await this.getCategories();
    const patternsByCategory: PatternIndex['patterns_by_category'] = {};
    let totalPatterns = 0;

    const categoryInfo: PatternIndex['categories'] = {};

    for (const category of categories) {
      const patterns = await this.getPatternsByCategory(category as PatternCategory);
      patternsByCategory[category as PatternCategory] = patterns;
      totalPatterns += patterns.length;

      categoryInfo[category as PatternCategory] = {
        name: this.formatCategoryName(category),
        description: this.getCategoryDescription(category),
        pattern_count: patterns.length,
      };
    }

    return {
      categories: categoryInfo,
      total_patterns: totalPatterns,
      patterns_by_category: patternsByCategory,
    };
  }

  async getCategories(): Promise<string[]> {
    const patternsDir = config.patternsPath;
    if (!(await fileExists(patternsDir))) {
      return [];
    }

    const entries = await readDir(patternsDir);
    const categories: string[] = [];

    for (const entry of entries) {
      const entryPath = path.join(patternsDir, entry);
      // Check if it's a directory (categories are directories)
      try {
        const files = await readDir(entryPath);
        if (files.length > 0) {
          categories.push(entry);
        }
      } catch {
        // Not a directory, skip
      }
    }

    return categories;
  }

  async getPatternsByCategory(category: PatternCategory | string): Promise<Pattern[]> {
    // Check cache
    if (this.isCacheValid() && this.cache.has(category)) {
      return this.cache.get(category) || [];
    }

    const categoryPath = path.join(config.patternsPath, category);
    if (!(await fileExists(categoryPath))) {
      return [];
    }

    const files = await readDir(categoryPath);
    const patterns: Pattern[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(categoryPath, file);
        const patternFile = await readJsonFile<PatternFile>(filePath);
        if (patternFile?.patterns) {
          patterns.push(...patternFile.patterns);
        }
      }
    }

    // Update cache
    this.cache.set(category, patterns);
    this.lastCacheTime = Date.now();

    return patterns;
  }

  async getPatternById(id: string): Promise<Pattern | null> {
    const categories = await this.getCategories();

    for (const category of categories) {
      const patterns = await this.getPatternsByCategory(category as PatternCategory);
      const pattern = patterns.find(p => p.id === id);
      if (pattern) return pattern;
    }

    return null;
  }

  async searchPatterns(query: string): Promise<Pattern[]> {
    const categories = await this.getCategories();
    const results: Pattern[] = [];
    const lowerQuery = query.toLowerCase();

    for (const category of categories) {
      const patterns = await this.getPatternsByCategory(category as PatternCategory);
      for (const pattern of patterns) {
        if (
          pattern.name.toLowerCase().includes(lowerQuery) ||
          pattern.description.toLowerCase().includes(lowerQuery) ||
          pattern.tags.some(t => t.toLowerCase().includes(lowerQuery))
        ) {
          results.push(pattern);
        }
      }
    }

    return results;
  }

  async getPatternsByTag(tag: string): Promise<Pattern[]> {
    const categories = await this.getCategories();
    const results: Pattern[] = [];

    for (const category of categories) {
      const patterns = await this.getPatternsByCategory(category as PatternCategory);
      results.push(...patterns.filter(p => p.tags.includes(tag)));
    }

    return results;
  }

  async getAllTags(): Promise<string[]> {
    const categories = await this.getCategories();
    const tags = new Set<string>();

    for (const category of categories) {
      const patterns = await this.getPatternsByCategory(category as PatternCategory);
      for (const pattern of patterns) {
        for (const tag of pattern.tags) {
          tags.add(tag);
        }
      }
    }

    return Array.from(tags).sort();
  }

  clearCache(): void {
    this.cache.clear();
    this.lastCacheTime = 0;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheTime < this.CACHE_TTL;
  }

  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      authentication: 'Patterns for user authentication, JWT, sessions, and security',
      api: 'RESTful API design, endpoints, and request handling patterns',
      database: 'Database access, ORM patterns, and data persistence',
      testing: 'Unit testing, integration testing, and test utilities',
      react: 'React component patterns, hooks, and state management',
    };

    return descriptions[category] || `Patterns for ${this.formatCategoryName(category)}`;
  }
}

export const patternService = new PatternService();
