import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  BarChart3, 
  Upload, 
  Cloud, 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  LineChart,
  PieChart,
  Lock,
  Key,
  FileCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Headphones,
  Activity,
  TrendingUp,
  Database,
  Eye
} from "lucide-react";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";

const personas = [
  { icon: LineChart, title: "Data Analysts", description: "Build insights faster" },
  { icon: Users, title: "Team Leads", description: "Track team metrics" },
  { icon: TrendingUp, title: "Executives", description: "Strategic overview" },
  { icon: Database, title: "Data Engineers", description: "Integrate any source" },
  { icon: Eye, title: "Stakeholders", description: "Share dashboards" },
];

const features = [
  {
    icon: Upload,
    title: "Universal Data Import",
    description: "Upload any file type - CSV, Excel, JSON, or import directly from URLs.",
    outcome: "60% faster data onboarding",
  },
  {
    icon: Cloud,
    title: "Cloud Integration",
    description: "Connect Google Drive, OneDrive, and Notion seamlessly.",
    outcome: "Zero manual data transfer",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Let AI analyze your data and surface actionable recommendations.",
    outcome: "10x faster analysis",
  },
  {
    icon: PieChart,
    title: "Rich Visualizations",
    description: "Choose from bar charts, line graphs, pie charts, KPIs, and more.",
    outcome: "Professional reports instantly",
  },
  {
    icon: Zap,
    title: "Real-Time Dashboards",
    description: "Auto-updating dashboards with live data connections.",
    outcome: "Always current metrics",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-tenant workspaces with role-based access control.",
    outcome: "Secure team sharing",
  },
];

const steps = [
  { number: "01", title: "Connect Your Data", description: "Upload files or connect to cloud storage services" },
  { number: "02", title: "AI Analysis", description: "Our AI analyzes your data and suggests visualizations" },
  { number: "03", title: "Customize Dashboard", description: "Drag, drop, and configure widgets to your needs" },
  { number: "04", title: "Share & Collaborate", description: "Publish dashboards and invite your team" },
];

const trustFeatures = [
  { icon: Lock, title: "SSO Integration", description: "SAML 2.0 and OAuth 2.0 support" },
  { icon: Key, title: "Role-Based Access", description: "Granular permissions by role" },
  { icon: FileCheck, title: "Audit Logging", description: "Complete activity trails" },
  { icon: Clock, title: "Data Retention", description: "Configurable policies" },
  { icon: Shield, title: "Encryption", description: "AES-256 at rest and in transit" },
  { icon: Activity, title: "99.9% Uptime", description: "Enterprise SLA guaranteed" },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = ref.current?.querySelectorAll(".scroll-reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function SplashPage() {
  const containerRef = useScrollReveal();
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: smoothTransition,
      };

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Fixed Navigation */}
      <motion.header
        initial={shouldReduceMotion ? {} : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...smoothTransition, duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2" data-testid="link-logo">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg">DashGen</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">
              How It Works
            </a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-security">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/auth">
              <Button variant="ghost" size="sm" data-testid="button-sign-in">
                Sign In
              </Button>
            </a>
            <a href="/auth">
              <Button size="sm" data-testid="button-get-started">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </motion.header>

      <main className="pt-14">
        {/* Hero Section with Gradient Lighting */}
        <section className="relative min-h-[85vh] flex items-center hero-gradient overflow-hidden">
          <div className="container mx-auto px-4 py-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <Badge variant="secondary" className="text-xs px-3 py-1" data-testid="badge-internal">
                  Internal Tool
                </Badge>
              </motion.div>
              
              <motion.h1
                {...motionProps}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
                data-testid="heading-hero"
              >
                Transform Any Data Into{" "}
                <span className="gradient-text">Intelligent Dashboards</span>
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
                data-testid="text-hero-description"
              >
                Enterprise-grade dashboard generator for internal teams. Upload files, 
                connect cloud storage, and let AI create actionable insights in seconds.
              </motion.p>
              
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <a href="/auth">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-primary">
                    <Sparkles className="h-4 w-4" />
                    Start Building Dashboards
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-secondary">
                    See How It Works
                  </Button>
                </a>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              >
                <span className="trust-badge" data-testid="badge-sso">
                  <Lock className="h-3 w-3" />
                  SSO Enabled
                </span>
                <span className="trust-badge" data-testid="badge-compliant">
                  <Shield className="h-3 w-3" />
                  SOC 2 Compliant
                </span>
                <span className="trust-badge" data-testid="badge-uptime">
                  <Activity className="h-3 w-3" />
                  99.9% Uptime
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Role-Based Value Strip */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="scroll-reveal">
              <p className="text-center text-sm text-muted-foreground mb-8" data-testid="text-personas-heading">
                Built for internal teams across your organization
              </p>
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                {personas.map((persona, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center"
                    data-testid={`persona-${index}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                      <persona.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{persona.title}</span>
                    <span className="text-xs text-muted-foreground">{persona.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="scroll-reveal text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-features">
                Enterprise Features, Zero Complexity
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to transform raw data into strategic insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="scroll-reveal surface-gradient hover-elevate"
                  style={{ transitionDelay: `${index * 50}ms` }}
                  data-testid={`card-feature-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {feature.outcome}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-muted/30 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="scroll-reveal text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-how-it-works">
                From Data to Dashboard in 4 Steps
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes, not days
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="scroll-reveal text-center"
                  style={{ transitionDelay: `${index * 100}ms` }}
                  data-testid={`step-${index}`}
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section id="security" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="scroll-reveal text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise Security
              </Badge>
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-security">
                Built for Enterprise Trust
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Security and compliance at every layer
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trustFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="scroll-reveal text-center"
                  style={{ transitionDelay: `${index * 50}ms` }}
                  data-testid={`trust-feature-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4">
            <div className="scroll-reveal max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-final-cta">
                Ready to Transform Your Data?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join internal teams using DashGen to make smarter, data-driven decisions.
              </p>
              <a href="/auth">
                <Button size="lg" className="gap-2" data-testid="button-final-cta">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <BarChart3 className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium">DashGen</span>
              <span className="text-sm text-muted-foreground">
                © 2025 All rights reserved.
              </span>
            </div>
            
            <nav className="flex items-center gap-6">
              <a 
                href="/docs" 
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-docs"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Documentation
              </a>
              <a 
                href="#" 
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-support"
              >
                <Headphones className="h-3.5 w-3.5" />
                Support
              </a>
              <a 
                href="#" 
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-status"
              >
                <Activity className="h-3.5 w-3.5" />
                Status
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
