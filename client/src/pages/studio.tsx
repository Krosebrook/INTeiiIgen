import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Plus, LayoutGrid, ArrowRight, Loader2 } from "lucide-react";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";
import type { Dashboard } from "@shared/schema";

export default function StudioPage() {
  const { data: dashboards, isLoading } = useQuery<Dashboard[]>({
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
      <motion.div variants={fadeInUp} transition={smoothTransition}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wand2 className="h-6 w-6" />
              Dashboard Studio
            </h1>
            <p className="text-muted-foreground mt-1">
              Visually build and edit your dashboards with drag-and-drop widgets
            </p>
          </div>
          <Link href="/new">
            <Button data-testid="button-create-dashboard">
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !dashboards || dashboards.length === 0 ? (
        <motion.div variants={fadeInUp} transition={smoothTransition}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Dashboards Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Create your first dashboard to start building visualizations with the Studio.
              </p>
              <Link href="/new">
                <Button data-testid="button-create-first-dashboard">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {dashboards.map((dashboard, index) => (
            <motion.div
              key={dashboard.id}
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: index * 0.05 }}
            >
              <Link href={`/studio/${dashboard.id}`}>
                <Card className="cursor-pointer hover-elevate transition-all h-full" data-testid={`card-dashboard-${dashboard.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{dashboard.title}</CardTitle>
                      {dashboard.isPublic && (
                        <Badge variant="secondary" className="text-xs">Public</Badge>
                      )}
                    </div>
                    {dashboard.description && (
                      <CardDescription className="line-clamp-2">{dashboard.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDate(dashboard.updatedAt)}
                      </span>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Open Studio
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
