import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { BarChart3, Shield, Zap, CheckCircle2 } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";

const benefits = [
  { icon: Zap, text: "Create dashboards in seconds" },
  { icon: Shield, text: "Enterprise-grade security" },
  { icon: CheckCircle2, text: "No credit card required" },
];

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-semibold">DashGen</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-14 min-h-screen flex">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={smoothTransition}
          className="hidden lg:flex lg:w-1/2 bg-muted/30 items-center justify-center p-12"
        >
          <div className="max-w-md">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <h1 className="text-3xl font-bold tracking-tight mb-4">
                  Transform your data into actionable insights
                </h1>
                <p className="text-muted-foreground text-lg">
                  Join thousands of teams using DashGen to make smarter, data-driven decisions.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-4 pt-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  "DashGen transformed how our team analyzes data. We went from spending hours creating reports to having real-time insights in minutes."
                </p>
                <p className="text-sm font-medium mt-2">— Sarah Chen, Data Lead at TechCorp</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothTransition, delay: 0.1 }}
          className="flex-1 flex items-center justify-center p-6"
        >
          <Card className="w-full max-w-md" data-testid="card-auth">
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl" data-testid="title-auth">
                Get started with DashGen
              </CardTitle>
              <CardDescription data-testid="description-auth">
                Create your free account to start building dashboards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-3"
              >
                <motion.div variants={fadeInUp}>
                  <Button
                    onClick={handleSignIn}
                    className="w-full h-11 gap-3"
                    data-testid="button-continue-google"
                  >
                    <SiGoogle className="h-4 w-4" />
                    Continue with Google
                  </Button>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Button
                    onClick={handleSignIn}
                    variant="outline"
                    className="w-full h-11 gap-3"
                    data-testid="button-continue-github"
                  >
                    <SiGithub className="h-4 w-4" />
                    Continue with GitHub
                  </Button>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Button
                    onClick={handleSignIn}
                    variant="outline"
                    className="w-full h-11 gap-3"
                    data-testid="button-continue-apple"
                  >
                    <SiApple className="h-4 w-4" />
                    Continue with Apple
                  </Button>
                </motion.div>
              </motion.div>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Button
                  onClick={handleSignIn}
                  variant="secondary"
                  className="w-full h-11"
                  data-testid="button-continue-email"
                >
                  Continue with Email
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-xs text-muted-foreground pt-4"
              >
                By continuing, you agree to our{" "}
                <a href="#" className="underline hover:text-foreground">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-foreground">
                  Privacy Policy
                </a>
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-2"
              >
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={handleSignIn}
                    className="text-primary font-medium hover:underline"
                    data-testid="button-sign-in"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border-t">
        © 2025 DashGen. All rights reserved.
      </footer>
    </div>
  );
}
