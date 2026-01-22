import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart3, Upload, Cloud, Sparkles, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Universal Data Import",
    description: "Upload any file type - spreadsheets, documents, images, or import from URLs. We handle the parsing.",
  },
  {
    icon: Cloud,
    title: "Cloud Integration",
    description: "Connect Google Drive, OneDrive, and Notion. Access your data wherever it lives.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Let AI analyze your data and generate actionable insights automatically.",
  },
  {
    icon: Zap,
    title: "Instant Dashboards",
    description: "Generate beautiful, interactive dashboards in seconds with our smart layout engine.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Built for teams with multi-tenant support, row-level security, and audit logs.",
  },
  {
    icon: BarChart3,
    title: "Rich Visualizations",
    description: "Choose from bar charts, line graphs, pie charts, tables, and more for your data.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">DashGen</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/api/login">
              <Button variant="outline" data-testid="button-login">
                Log In
              </Button>
            </a>
            <a href="/api/login">
              <Button data-testid="button-get-started">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform Any Data Into
              <span className="gradient-text block mt-2">Intelligent Dashboards</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload files, connect cloud storage, or paste URLs. Our AI analyzes your data
              and generates beautiful, interactive dashboards in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/api/login">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-cta">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Building Free
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-demo">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required
            </p>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From data import to AI analysis, DashGen provides all the tools
                you need to turn raw data into actionable insights.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card/50 hover-elevate transition-all">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of teams using DashGen to make better data-driven decisions.
            </p>
            <a href="/api/login">
              <Button size="lg" data-testid="button-footer-cta">
                Create Your First Dashboard
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 DashGen. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
