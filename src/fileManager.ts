import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { TimeData, Project } from "./types";
import { CONFIG } from "./constants";

export class FileManager {
  private static instance: FileManager;
  private timeDataPath: string;
  private colorsPath: string;

  private constructor(private context: vscode.ExtensionContext) {
    this.timeDataPath = path.join(
      context.extensionPath,
      CONFIG.FILE_NAMES.TIME_DATA
    );
    this.colorsPath = path.join(
      context.extensionPath,
      CONFIG.FILE_NAMES.COLORS
    );
    this.initializeFiles();
  }

  static getInstance(context: vscode.ExtensionContext): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager(context);
    }
    return FileManager.instance;
  }

  getTimeData(): TimeData {
    try {
      const data = fs.readFileSync(this.timeDataPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return this.createDefaultTimeData();
    }
  }

  saveTimeData(timeData: TimeData): void {
    try {
      fs.writeFileSync(this.timeDataPath, JSON.stringify(timeData, null, 2));
    } catch (error) {
      vscode.window.showErrorMessage("Failed to save time data");
    }
  }

  updateProjectTime(
    projectName: string,
    seconds: number,
    languageId: string
  ): void {
    const timeData = this.getTimeData();
    const project = this.findOrCreateProject(timeData, projectName);

    project.currentSession = seconds;
    project.totalTime += 1;

    if (languageId) {
      project.languageTime[languageId] =
        (project.languageTime[languageId] || 0) + 1;
    }

    this.saveTimeData(timeData);
  }

  resetData(): void {
    const defaultData = this.createDefaultTimeData();
    this.saveTimeData(defaultData);
  }

  saveProjectPause(projectName: string, currentSession: number): void {
    const timeData = this.getTimeData();
    const project = this.findOrCreateProject(timeData, projectName);

    project.prevSession = project.currentSession;
    project.currentSession = currentSession;

    this.saveTimeData(timeData);
  }

  private initializeFiles(): void {
    if (!fs.existsSync(this.timeDataPath)) {
      this.saveTimeData(this.createDefaultTimeData());
    }

    if (!fs.existsSync(this.colorsPath)) {
      fs.writeFileSync(this.colorsPath, JSON.stringify({}));
    }
  }

  private findOrCreateProject(
    timeData: TimeData,
    projectName: string
  ): Project {
    let project = timeData.projects.find((p) => p.projectName === projectName);

    if (!project) {
      project = {
        currentSession: 0,
        prevSession: 0,
        totalTime: 0,
        projectName,
        languageTime: {},
      };
      timeData.projects.push(project);
    }

    return project;
  }

  private createDefaultTimeData(): TimeData {
    return {
      projects: [],
    };
  }
}
