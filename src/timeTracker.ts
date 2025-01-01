import * as vscode from "vscode";
import { FileManager } from "./fileManager";
import { CONFIG } from "./constants";
import { StatusBarManager } from "./statusBar";

export class TimeTracker {
  private seconds: number = 0;
  private timerInterval?: NodeJS.Timeout;
  private currentProject: string = "";
  private currentLang: string = "";
  private fileManager: FileManager;
  private statusBarManager: StatusBarManager;

  constructor(
    private context: vscode.ExtensionContext,
    statusBarManager: StatusBarManager
  ) {
    this.fileManager = FileManager.getInstance(context);
    this.statusBarManager = statusBarManager;
    this.initializeListeners();
  }

  initialize() {
    this.currentProject = vscode.workspace.name || "unknown";
    if (vscode.window.activeTextEditor) {
      this.currentLang = vscode.window.activeTextEditor.document.languageId;
    }
    this.statusBarManager.initialize();
    this.initializeWindowFocusListeners();
    if (vscode.window.state.focused) {
      this.start();
    } else {
      this.statusBarManager.updatePauseStatus(true);
    }
  }

  start() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, CONFIG.TIMER_INTERVAL);

    vscode.window.showInformationMessage("Timer started!");
  }

  togglePause() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
      vscode.window.showInformationMessage("Timer paused!");
    } else {
      this.start();
    }
  }

  reset() {
    this.seconds = 0;
    this.fileManager.resetData();
    this.start();
  }

  get isTimerRunning(): boolean {
    return this.timerInterval !== undefined;
  }

  private updateTimer() {
    this.seconds++;
    this.fileManager.updateProjectTime(
      this.currentProject,
      this.seconds,
      this.currentLang
    );
    this.statusBarManager.updateTimer(this.seconds);

    if (this.seconds % CONFIG.BREAK_REMINDER_INTERVAL === 0) {
      vscode.window.showInformationMessage("Time for a break!");
    }
  }

  private initializeListeners() {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.currentLang = editor.document.languageId;
      }
    });
  }

  private initializeWindowFocusListeners() {
    vscode.window.onDidChangeWindowState((windowState) => {
      if (windowState.focused) {
        if (!this.isTimerRunning) {
          this.start();
          this.statusBarManager.updatePauseStatus(false);
        }
      } else {
        if (this.isTimerRunning) {
          this.togglePause();
          this.statusBarManager.updatePauseStatus(true);
        }
      }
    });
  }

  dispose() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
