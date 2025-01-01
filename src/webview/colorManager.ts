import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "../constants";

export class ColorManager {
  private colors: Record<string, string> = {};
  private colorsPath: string;

  constructor(context: vscode.ExtensionContext) {
    this.colorsPath = path.join(
      context.extensionPath,
      CONFIG.FILE_NAMES.COLORS
    );
    this.loadColors();
  }

  getColorForLanguage(language: string): string {
    if (!this.colors[language]) {
      this.colors[language] = this.generateRandomColor();
      this.saveColors();
    }
    return this.colors[language];
  }

  getColorForProject(projectName: string): string {
    const key = `project_${projectName}`;
    if (!this.colors[key]) {
      this.colors[key] = this.generateRandomColor();
      this.saveColors();
    }
    return this.colors[key];
  }

  private generateRandomColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const a = Math.random().toFixed(1);
    return `rgba(${r},${g},${b},${a})`;
  }

  private loadColors(): void {
    try {
      if (fs.existsSync(this.colorsPath)) {
        this.colors = JSON.parse(fs.readFileSync(this.colorsPath, "utf8"));
      }
    } catch (error) {
      this.colors = {};
    }
  }

  private saveColors(): void {
    try {
      fs.writeFileSync(this.colorsPath, JSON.stringify(this.colors, null, 2));
    } catch (error) {
      vscode.window.showErrorMessage("Failed to save color data");
    }
  }
}
