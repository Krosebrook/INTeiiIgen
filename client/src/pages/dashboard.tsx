import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, LayoutDashboard, Loader2, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";
import type { Dashboard, Widget } from "@shared/schema";

interface DashboardWithWidgets extends Dashboard {
  widgetCount?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: dashboards, isLoading } = useQuery<DashboardWithWidgets[]>({
    queryKey: ["/api/dashboards"],
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={smoothTransition}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your dashboards
          </p>
        </div>
        <Link href="/new">
          <Button data-testid="button-new-dashboard-header">
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : dashboards && dashboards.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {dashboards.map((dashboard, index) => (
            <motion.div
              key={dashboard.id}
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: index * 0.05 }}
            >
              <Link href={`/dashboard/${dashboard.id}`}>
                <Card className="h-full cursor-pointer hover-elevate transition-all" data-testid={`card-dashboard-${dashboard.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <motion.div
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </motion.div>
                      {dashboard.isPublic && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-3">{dashboard.title}</CardTitle>
                    {dashboard.description && (
                      <CardDescription className="line-clamp-2">
                        {dashboard.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <LayoutDashboard className="h-3 w-3" />
                        {dashboard.widgetCount || 0} widgets
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(dashboard.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} transition={smoothTransition}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                className="rounded-full bg-muted p-4 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No dashboards yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Create your first dashboard by uploading data or connecting to a cloud service.
              </p>
              <Link href="/new">
                <Button data-testid="button-create-first-dashboard">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
