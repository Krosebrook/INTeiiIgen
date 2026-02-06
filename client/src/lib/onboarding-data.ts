export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
  aiContext?: string;
}

export interface PageTour {
  pageId: string;
  pageName: string;
  description: string;
  route: string;
  steps: OnboardingStep[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  route: string;
  checkKey: string;
}

export const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  {
    id: "upload-data",
    label: "Upload your first data source",
    description: "Import a CSV, JSON, or Excel file to get started",
    route: "/data",
    checkKey: "checklist_upload-data",
  },
  {
    id: "create-dashboard",
    label: "Create a dashboard",
    description: "Build your first interactive dashboard",
    route: "/new",
    checkKey: "checklist_create-dashboard",
  },
  {
    id: "add-widget",
    label: "Add a chart widget",
    description: "Visualize your data with a chart",
    route: "/",
    checkKey: "checklist_add-widget",
  },
  {
    id: "explore-insights",
    label: "View AI insights",
    description: "Let AI analyze your data patterns",
    route: "/insights",
    checkKey: "checklist_explore-insights",
  },
  {
    id: "connect-cloud",
    label: "Connect cloud storage",
    description: "Link Google Drive, OneDrive, or Notion",
    route: "/data",
    checkKey: "checklist_connect-cloud",
  },
];

export const PAGE_TOURS: Record<string, PageTour> = {
  "/": {
    pageId: "dashboard",
    pageName: "Dashboard",
    description: "Your command center for all dashboards",
    route: "/",
    steps: [
      {
        id: "dash-welcome",
        target: '[data-testid="link-logo"]',
        title: "Welcome to DashGen",
        content: "This is your dashboard hub. From here you can view, create, and manage all your dashboards in one place.",
        placement: "right",
        aiContext: "User just landed on the main dashboard page. Help them understand the layout and where to start.",
      },
      {
        id: "dash-sidebar",
        target: '[data-testid="button-sidebar-toggle"]',
        title: "Navigation Sidebar",
        content: "Use the sidebar to navigate between sections: Home, Data, Studio, Insights, and Organizations.",
        placement: "right",
      },
      {
        id: "dash-new",
        target: '[data-testid="button-new-dashboard"]',
        title: "Create New Dashboard",
        content: "Click here to create your first dashboard. You can choose from templates or start from scratch.",
        placement: "right",
        aiContext: "User is learning about creating dashboards. Suggest what kind of dashboard they might want to create.",
      },
      {
        id: "dash-cards",
        target: '[data-testid="text-dashboards-heading"]',
        title: "Your Dashboards",
        content: "All your created dashboards will appear here as cards. Click any dashboard to view and edit its charts.",
        placement: "bottom",
      },
    ],
  },
  "/data": {
    pageId: "data",
    pageName: "Data",
    description: "Manage, upload, and connect your data sources",
    route: "/data",
    steps: [
      {
        id: "data-intro",
        target: '[data-testid="text-data-heading"]',
        title: "Your Data Hub",
        content: "This is your central hub for all data. View existing sources, upload files, or connect cloud storage -- all in one place.",
        placement: "bottom",
        aiContext: "User is on the data page. Explain how the tabs work and what file types are supported.",
      },
      {
        id: "data-tabs",
        target: '[data-testid="tabs-data"]',
        title: "Switch Between Views",
        content: "Use these tabs to view your data sources, upload new files, or connect cloud storage services.",
        placement: "bottom",
      },
      {
        id: "data-next",
        target: '[data-testid="button-create-dashboard-from-data"]',
        title: "Next Step",
        content: "Once you have data sources ready, create a dashboard to start visualizing your data.",
        placement: "bottom",
      },
    ],
  },
  "/new": {
    pageId: "new-dashboard",
    pageName: "New Dashboard",
    description: "Create a new dashboard",
    route: "/new",
    steps: [
      {
        id: "new-intro",
        target: '[data-testid="text-new-dashboard-heading"]',
        title: "Create a Dashboard",
        content: "Give your dashboard a name and description. AI suggestions can help you choose the perfect title.",
        placement: "bottom",
        aiContext: "User is creating a new dashboard. Suggest best practices for naming and organizing dashboards.",
      },
      {
        id: "new-templates",
        target: '[data-testid="section-layout-templates"]',
        title: "Layout Templates",
        content: "Choose from pre-built templates like Executive Overview, Sales Performance, or Analytics to get started quickly.",
        placement: "top",
      },
    ],
  },
  "/dashboard/:id": {
    pageId: "dashboard-view",
    pageName: "Dashboard View",
    description: "View and edit your dashboard",
    route: "/dashboard/:id",
    steps: [
      {
        id: "view-intro",
        target: '[data-testid="text-dashboard-title"]',
        title: "Your Dashboard",
        content: "This is your live dashboard. Widgets display your data as charts, tables, and statistics.",
        placement: "bottom",
        aiContext: "User is viewing a dashboard. Help them understand the different chart types and how to interact with data.",
      },
      {
        id: "view-add-widget",
        target: '[data-testid="button-visual-builder"]',
        title: "Visual Widget Builder",
        content: "Click here to add new chart widgets. Choose from bar charts, line charts, pie charts, and more.",
        placement: "bottom",
      },
      {
        id: "view-share",
        target: '[data-testid="button-share-dashboard"]',
        title: "Share Your Dashboard",
        content: "Share your dashboard with a public link or keep it private. Great for presenting data to your team.",
        placement: "bottom",
      },
    ],
  },
  "/insights": {
    pageId: "insights",
    pageName: "AI Insights",
    description: "AI-powered data analysis",
    route: "/insights",
    steps: [
      {
        id: "insights-intro",
        target: '[data-testid="text-insights-heading"]',
        title: "AI-Powered Insights",
        content: "DashGen uses AI to analyze your data and surface key patterns, trends, and anomalies automatically.",
        placement: "bottom",
        aiContext: "User is viewing AI insights. Help them understand what kinds of analysis they can get.",
      },
      {
        id: "insights-analyze",
        target: '[data-testid="link-nav-data"]',
        title: "Analyze Data Sources",
        content: "To generate insights, first make sure you have data sources uploaded. Each source can be analyzed for patterns.",
        placement: "right",
      },
    ],
  },
  "/organizations": {
    pageId: "organizations",
    pageName: "Organizations",
    description: "Team and organization management",
    route: "/organizations",
    steps: [
      {
        id: "org-intro",
        target: '[data-testid="text-org-heading"]',
        title: "Organizations",
        content: "Create organizations to collaborate with your team. Share dashboards and data sources across members.",
        placement: "bottom",
        aiContext: "User is exploring organizations. Help them understand multi-tenant features and roles.",
      },
      {
        id: "org-create",
        target: '[data-testid="button-create-org"]',
        title: "Create an Organization",
        content: "Set up your first organization and invite team members with different roles: Admin, Member, or Viewer.",
        placement: "bottom",
      },
    ],
  },
  "/studio": {
    pageId: "studio",
    pageName: "Dashboard Studio",
    description: "Visual dashboard builder",
    route: "/studio",
    steps: [
      {
        id: "studio-intro",
        target: '[data-testid="text-studio-heading"]',
        title: "Dashboard Studio",
        content: "The Studio gives you a visual canvas to design dashboards with drag-and-drop widgets and templates.",
        placement: "bottom",
        aiContext: "User is in the studio. Help them understand the visual builder versus the standard dashboard creator.",
      },
    ],
  },
};

export function getPageTour(pathname: string): PageTour | null {
  if (PAGE_TOURS[pathname]) return PAGE_TOURS[pathname];
  if (pathname.startsWith("/dashboard/")) return PAGE_TOURS["/dashboard/:id"] || null;
  if (pathname.startsWith("/studio/")) return PAGE_TOURS["/studio"] || null;
  if (pathname === "/sources" || pathname === "/upload" || pathname === "/cloud") return PAGE_TOURS["/data"] || null;
  return null;
}
