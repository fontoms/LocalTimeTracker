import { TimeData, Project, ChartData, SummaryChartData } from "../types";
import { formatTime } from "../utils";
import { ColorManager } from "./colorManager";

export class ChartDataProvider {
  constructor(private colorManager: ColorManager) {}

  getLanguageChartData(project: Project): ChartData {
    const data: number[] = [];
    const labels: string[] = [];
    const colors: string[] = [];

    for (const [language, time] of Object.entries(project.languageTime)) {
      data.push(time);
      labels.push(`${language}: ${formatTime(time)}`);
      colors.push(this.colorManager.getColorForLanguage(language));
    }

    return {
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: Array(data.length).fill("transparent"),
        },
      ],
      labels,
    };
  }

  getProjectChartData(timeData: TimeData): ChartData {
    const data: number[] = [];
    const labels: string[] = [];
    const colors: string[] = [];

    timeData.projects
      .filter((project) =>
        Object.values(project.languageTime).some((time) => time > 0)
      )
      .forEach((project) => {
        const totalTime = Object.values(project.languageTime).reduce(
          (sum, time) => sum + time,
          0
        );

        data.push(totalTime);
        labels.push(`${project.projectName}: ${formatTime(totalTime)}`);
        colors.push(this.colorManager.getColorForProject(project.projectName));
      });

    return {
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: Array(data.length).fill("transparent"),
        },
      ],
      labels,
    };
  }

  getSummaryChartData(timeData: TimeData): SummaryChartData {
    const labels: string[] = [];
    const data: number[] = [];

    timeData.projects.forEach((project) => {
      const projectName = project.projectName || "Unknown Project";
      labels.push(projectName);
      const totalTime = Object.values(project.languageTime).reduce(
        (sum, time) => sum + time,
        0
      );
      data.push(totalTime / 3600); // Convertir les secondes en heures
    });

    return {
      labels,
      datasets: [
        {
          label: "Total Time (hours)",
          data,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1,
        },
      ],
    };
  }
}
