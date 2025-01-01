import * as vscode from "vscode";
import { formatTime } from "./utils";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1
    );
  }

  initialize() {
    this.initializeStatusBarItem();
  }

  private initializeStatusBarItem() {
    this.statusBarItem.text = "LTT $(clock) 0s $(debug-pause)";
    this.statusBarItem.tooltip = "View stats";
    this.statusBarItem.command = "extension.getTime";
    this.statusBarItem.show();
  }

  updateTimer(seconds: number) {
    const isPaused = this.statusBarItem.text.includes("$(triangle-right)");
    const pauseIcon = isPaused ? "$(triangle-right)" : "$(debug-pause)";
    this.statusBarItem.text = `LTT $(clock) ${formatTime(
      seconds
    )} ${pauseIcon}`;
  }

  updatePauseStatus(isPaused: boolean) {
    const timeText = this.statusBarItem.text.match(/LTT \$(clock) \d+s/);
    if (timeText) {
      const pauseIcon = isPaused ? '$(triangle-right)' : '$(debug-pause)';
      this.statusBarItem.text = `${timeText[0]} ${pauseIcon}`;
    } else {
      const timeParts = this.statusBarItem.text.split(' ');
      const time = timeParts.slice(1, -1).join(' ');
      const pauseIcon = isPaused ? '$(triangle-right)' : '$(debug-pause)';
      this.statusBarItem.text = `LTT ${time} ${pauseIcon}`;
    }
  }
}
