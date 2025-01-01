import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { FileManager } from "../fileManager";
import { ChartDataProvider } from "./chartDataProvider";
import { formatTime } from "../utils";
import { SummaryChartData } from "../types";
import { CONFIG } from "../constants";

export class WebviewContentProvider {
  constructor(
    private context: vscode.ExtensionContext,
    private fileManager: FileManager,
    public chartDataProvider: ChartDataProvider
  ) {}

  getContent(): string {
    const projectName = vscode.workspace.name || "Unknown Project";
    const timeData = this.fileManager.getTimeData();
    const currentProject = timeData.projects.find(
      (p) => p.projectName === projectName
    );

    if (!currentProject) {
      return this.getEmptyContent();
    }

    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${CONFIG.WEBVIEW.TITLE}</title>
        ${this.getStyles()}
      </head>
      <body>
        <h1>${CONFIG.WEBVIEW.TITLE}</h1>

        <div class="header-div">
          <h2>Current session: <span id="currentSession">${formatTime(
            currentProject.currentSession
          )}</span></h2>
          <h2>Previous session: <span id="prevSession">${formatTime(
            currentProject.prevSession
          )}</span></h2>
        </div>

        <hr>

        <div id="chartContainer">
          <div class="chart-section">
            <h2>${projectName} total time: <span id="totalTime">${formatTime(
      currentProject.totalTime
    )}</span></h2>
            <canvas id="languagesChart"></canvas>
          </div>
          <div class="chart-section">
            <h2>Total coding time: <span id="totalCodingTime">${this.getTotalTime(
              timeData
            )}</span></h2>
            <canvas id="projectsChart"></canvas>
          </div>
        </div>

        <hr>

        <h2>Time by Project</h2>
        <div id="projectBreakdown">${this.getProjectBreakdown(timeData)}</div>

        <hr>

        <h2>Summary</h2>
        <div id="summaryContainer">
          <canvas id="summaryChart" style="height: ${
            CONFIG.CUSTOMIZABLE.SUMMARY_CHART_HEIGHT
          };"></canvas>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        ${this.getChartInitScript(currentProject, timeData)}
      </body>
      </html>
    `;

    this.saveContentForDebug(content);
    return content;
  }

  private saveContentForDebug(content: string): void {
    const debugPath = path.join(this.context.extensionPath, "debug.html");
    fs.writeFileSync(debugPath, content);
  }

  private getEmptyContent(): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>No tracking data available</h1>
          <p>Start coding to begin tracking your time!</p>
        </body>
      </html>
    `;
  }

  private getStyles(): string {
    return `
      <style>
        body {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .header-div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .chart-section {
          width: 48%;
          float: left;
          box-sizing: border-box;
        }
        #chartContainer {
          display: flex;
          justify-content: space-between;
          margin: 2rem 0;
          min-height: 300px;
          flex-wrap: wrap;
        }
        canvas {
          max-height: 400px;
        }
        hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid #ccc;
        }
        span {
          font-weight: normal;
        }
        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .project-section {
          box-sizing: border-box;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .language-stats {
          display: flex;
          align-items: center;
          margin: 0.5rem 0;
        }
        .language-bar {
          width: 12px;
          height: 12px;
          margin-right: 8px;
          border-radius: 2px;
        }
        #summaryContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        #summaryDetails {
          margin-top: 1rem;
          text-align: center;
        }
      </style>
    `;
  }

  private getChartInitScript(currentProject: any, timeData: any): string {
    const languageData =
      this.chartDataProvider.getLanguageChartData(currentProject);
    const projectData = this.chartDataProvider.getProjectChartData(timeData);
    const summaryData: SummaryChartData =
      this.chartDataProvider.getSummaryChartData(timeData);

    return `
      <script>
        let languageChart, projectChart, summaryChart;

        window.onload = () => {
          const ctxLanguages = document.getElementById('languagesChart').getContext('2d');
          const ctxProjects = document.getElementById('projectsChart').getContext('2d');
          const ctxSummary = document.getElementById('summaryChart').getContext('2d');

          languageChart = new Chart(ctxLanguages, {
            type: '${CONFIG.CUSTOMIZABLE.LANGUAGE_CHART_TYPE}',
            data: ${JSON.stringify(languageData)},
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'right' }
              }
            }
          });

          projectChart = new Chart(ctxProjects, {
            type: '${CONFIG.CUSTOMIZABLE.PROJECT_CHART_TYPE}',
            data: ${JSON.stringify(projectData)},
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'right' }
              }
            }
          });

          summaryChart = new Chart(ctxSummary, {
            type: '${CONFIG.CUSTOMIZABLE.SUMMARY_CHART_TYPE}',
            data: ${JSON.stringify(summaryData)},
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Hours' } }
              }
            }
          });
        };

        const vscode = acquireVsCodeApi();

        window.addEventListener('message', event => {
          const message = event.data;
          document.getElementById('currentSession').innerText = message.currentSession;
          document.getElementById('prevSession').innerText = message.prevSession;
          document.getElementById('totalTime').innerText = message.totalTime;
          document.getElementById('totalCodingTime').innerText = message.totalCodingTime;
          document.getElementById('projectBreakdown').innerHTML = message.projectBreakdown;
          document.getElementById('summaryDetails').innerHTML = message.summaryDetails;

          // Update chart data without reloading the charts
          updateChartData(languageChart, message.languageData);
          updateChartData(projectChart, message.projectData);
          updateChartData(summaryChart, message.summaryData);
        });
      </script>
    `;
  }

  public getTotalTime(timeData: any): string {
    const totalSeconds = timeData.projects.reduce(
      (total: number, project: any) => {
        return (
          total +
          Object.values(
            project.languageTime as { [key: string]: number }
          ).reduce((sum: number, time: number) => sum + time, 0)
        );
      },
      0
    );

    return formatTime(totalSeconds);
  }

  public getProjectBreakdown(timeData: any): string {
    return `
      <div class="project-grid">
        ${timeData.projects
          .filter((project: any) =>
            Object.values(project.languageTime).some(
              (time) => (time as number) > 0
            )
          )
          .map((project: any) => {
            const languages = Object.entries(project.languageTime)
              .map(
                ([lang, time]) => `
                <div class="language-stats">
                  <div class="language-bar" style="background-color: ${
                    this.chartDataProvider.getLanguageChartData(project)
                      .datasets[0].backgroundColor[0]
                  }"></div>
                  <span>${lang}: ${formatTime(time as number)}</span>
                </div>
              `
              )
              .join("");

            return `
              <div class="project-section">
                <h3>${project.projectName}</h3>
                ${languages}
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }
}
