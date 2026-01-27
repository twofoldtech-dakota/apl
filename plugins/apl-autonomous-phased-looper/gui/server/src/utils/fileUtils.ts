// File Utilities
import fs from 'fs-extra';
import path from 'path';

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
    return null;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return null;
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<boolean> {
  try {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Create backup if file exists
    if (await fs.pathExists(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copy(filePath, backupPath);
    }

    // Write the file
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    return false;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function readDir(dirPath: string): Promise<string[]> {
  try {
    if (await fs.pathExists(dirPath)) {
      return fs.readdir(dirPath);
    }
    return [];
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}
