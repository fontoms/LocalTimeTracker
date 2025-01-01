export interface TimeData {
  projects: Project[];
}

export interface Project {
  currentSession: number;
  prevSession: number;
  totalTime: number;
  projectName: string;
  languageTime: Record<string, number>;
}

export interface ChartData {
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
  labels: string[];
}

export interface SummaryChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}
