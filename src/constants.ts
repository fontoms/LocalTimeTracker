export const CONFIG = {
  TIMER_INTERVAL: 1000,
  BREAK_REMINDER_INTERVAL: 1800,
  DEFAULT_COLOR: "rgba(143,9,9,0.56)",
  FILE_NAMES: {
    TIME_DATA: "timeTraked.json",
    COLORS: "colors.json",
  },
  WEBVIEW: {
    TITLE: "Time Tracker Stats",
    ENABLE_SCRIPTS: true,
    RETAIN_CONTEXT_WHEN_HIDDEN: true,
  },
  CUSTOMIZABLE: {
    SUMMARY_CHART_HEIGHT: "400px",
    LANGUAGE_CHART_TYPE: "pie",
    PROJECT_CHART_TYPE: "pie",
    SUMMARY_CHART_TYPE: "line",
  },
} as const;
