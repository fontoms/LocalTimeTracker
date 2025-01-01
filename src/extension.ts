import * as vscode from "vscode";
import { TimeTracker } from "./timeTracker";
import { StatusBarManager } from "./statusBar";
import { WebviewManager } from "./webview/webviewManager";

let timeTracker: TimeTracker;
let statusBarManager: StatusBarManager;
let webviewManager: WebviewManager;

export function activate(context: vscode.ExtensionContext) {
  statusBarManager = new StatusBarManager(context);
  timeTracker = new TimeTracker(context, statusBarManager);
  webviewManager = new WebviewManager(context);

  registerCommands(context);
  initializeExtension();
}

function registerCommands(context: vscode.ExtensionContext) {
  const commands = [
    vscode.commands.registerCommand("extension.initTimer", () =>
      timeTracker.start()
    ),
    vscode.commands.registerCommand("extension.getTime", () =>
      webviewManager.show()
    ),
    vscode.commands.registerCommand("extension.updateStatusTimer", () => {
      timeTracker.togglePause();
      statusBarManager.updatePauseStatus(!timeTracker.isTimerRunning);
    }),
    vscode.commands.registerCommand("extension.clearStatsRestartTimer", () =>
      timeTracker.reset()
    ),
  ];

  context.subscriptions.push(...commands);
}

function initializeExtension() {
  timeTracker.initialize();
}

export function deactivate() {
  timeTracker.dispose();
}
