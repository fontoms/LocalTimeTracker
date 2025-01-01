import * as vscode from "vscode";
import { FileManager } from "../fileManager";
import { WebviewContentProvider } from "./webviewContentProvider";
import { ChartDataProvider } from "./chartDataProvider";
import { ColorManager } from "./colorManager";
import { CONFIG } from "../constants";
import { formatTime } from "../utils";

export class WebviewManager {
  private currentPanel?: vscode.WebviewPanel;
  private contentProvider: WebviewContentProvider;

  constructor(private context: vscode.ExtensionContext) {
    const colorManager = new ColorManager(context);
    const chartDataProvider = new ChartDataProvider(colorManager);
    this.contentProvider = new WebviewContentProvider(
      context,
      FileManager.getInstance(context),
      chartDataProvider
    );
  }

  show(): void {
    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (this.currentPanel) {
      this.currentPanel.reveal(columnToShowIn);
      return;
    }

    this.currentPanel = vscode.window.createWebviewPanel(
      "timeTrackerStats",
      CONFIG.WEBVIEW.TITLE,
      vscode.ViewColumn.One,
      {
        enableScripts: CONFIG.WEBVIEW.ENABLE_SCRIPTS,
        retainContextWhenHidden: CONFIG.WEBVIEW.RETAIN_CONTEXT_WHEN_HIDDEN,
      }
    );

    this.updateContent();

    this.currentPanel.onDidDispose(
      () => {
        this.currentPanel = undefined;
      },
      null,
      this.context.subscriptions
    );

    this.startDynamicUpdates();
  }

  private updateContent(): void {
    if (!this.currentPanel) return;

    this.currentPanel.webview.html = this.contentProvider.getContent();
  }

  private startDynamicUpdates(): void {
    setInterval(() => {
      if (!this.currentPanel) return;

      const timeData = FileManager.getInstance(this.context).getTimeData();
      const projectName = vscode.workspace.name || "Unknown Project";
      const currentProject = timeData.projects.find(
        (p) => p.projectName === projectName
      );

      if (!currentProject) return;

      const message = {
        currentSession: formatTime(currentProject.currentSession),
        prevSession: formatTime(currentProject.prevSession),
        totalTime: formatTime(currentProject.totalTime),
        totalCodingTime: this.contentProvider.getTotalTime(timeData),
        projectBreakdown: this.contentProvider.getProjectBreakdown(timeData),
        languageData:
          this.contentProvider.chartDataProvider.getLanguageChartData(
            currentProject
          ),
        projectData:
          this.contentProvider.chartDataProvider.getProjectChartData(timeData),
        summaryData:
          this.contentProvider.chartDataProvider.getSummaryChartData(timeData),
      };

      this.currentPanel.webview.postMessage(message);
    }, CONFIG.TIMER_INTERVAL);
  }
}
