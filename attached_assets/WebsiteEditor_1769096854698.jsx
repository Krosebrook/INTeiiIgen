import { Suspense, lazy } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

// Editor components (always loaded)
import EditorHeader from "@/components/websiteEditor/EditorHeader";
import EditorTabList from "@/components/websiteEditor/EditorTabList";
import useWebsiteEditor from "@/components/websiteEditor/useWebsiteEditor";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import PermissionGuard from "@/components/auth/PermissionGuard";

// Lazy-loaded feature components
const WYSIWYGEditor = lazy(() => import("@/components/editor/WYSIWYGEditor"));
const AdvancedAnalyticsDashboard = lazy(() => import("@/components/analytics/AdvancedAnalyticsDashboard"));
const AnalyticsTrackingScript = lazy(() => import("@/components/analytics/AnalyticsTrackingScript"));
const AISeoPowerAudit = lazy(() => import("@/components/seo/AISeoPowerAudit"));
const SEOContentGenerator = lazy(() => import("@/components/seo/SEOContentGenerator"));
const ContentGapAnalyzer = lazy(() => import("@/components/seo/ContentGapAnalyzer"));
const MetaTagOptimizer = lazy(() => import("@/components/seo/MetaTagOptimizer"));
const FAQGenerator = lazy(() => import("@/components/seo/FAQGenerator"));
const InternalLinkingSuggestions = lazy(() => import("@/components/seo/InternalLinkingSuggestions"));
const CoreWebVitalsAnalyzer = lazy(() => import("@/components/performance/CoreWebVitalsAnalyzer"));
const CDNIntegration = lazy(() => import("@/components/optimization/CDNIntegration"));
const ABTestDashboard = lazy(() => import("@/components/testing/ABTestDashboard"));
const WebsiteTeamManager = lazy(() => import("@/components/collaboration/WebsiteTeamManager"));
const VersionHistory = lazy(() => import("@/components/collaboration/VersionHistory"));
const WebsiteComments = lazy(() => import("@/components/collaboration/WebsiteComments"));
const MetaTagManager = lazy(() => import("@/components/seo/MetaTagManager"));
const SitemapGenerator = lazy(() => import("@/components/seo/SitemapGenerator"));
const OnPageSEOAnalyzer = lazy(() => import("@/components/seo/OnPageSEOAnalyzer"));
const AIContentAssistant = lazy(() => import("@/components/content/AIContentAssistant"));
const AIPersonalizationEngine = lazy(() => import("@/components/personalization/AIPersonalizationEngine"));
const SegmentManager = lazy(() => import("@/components/personalization/SegmentManager"));
const AdvancedDeploymentSettings = lazy(() => import("@/components/deployment/AdvancedDeploymentSettings"));
const AdvancedDeploymentHub = lazy(() => import("@/components/deployment/AdvancedDeploymentHub"));
const AISeoPowerTools = lazy(() => import("@/components/seo/AISeoPowerTools"));
const CompetitorAnalyzer = lazy(() => import("@/components/seo/CompetitorAnalyzer"));
const RankingInsights = lazy(() => import("@/components/seo/RankingInsights"));
const AIDesignVariations = lazy(() => import("@/components/ai/AIDesignVariations"));

// Tab loading fallback
function TabLoader() {
  return (
    <Card className="bg-white/5 border-white/20">
      <CardContent className="p-8 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-400">Loading...</span>
      </CardContent>
    </Card>
  );
}

export default function WebsiteEditor() {
  const navigate = useNavigate();
  const {
    website,
    setWebsite,
    isLoading,
    userRole,
    seoAuditData,
    canEdit,
    handleSave,
    refetch,
  } = useWebsiteEditor();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <LoadingState message="Loading editor..." />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <EmptyState
          title="Website not found"
          action={
            <Button onClick={() => navigate(createPageUrl("Projects"))}>
              Go to Projects
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <EditorHeader website={website} userRole={userRole} />

        <Tabs defaultValue="editor" className="space-y-4">
          <EditorTabList canEdit={canEdit} />

          <TabsContent value="editor">
            <PermissionGuard category="websites" action="edit">
              {canEdit ? (
                <Suspense fallback={<TabLoader />}>
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <WYSIWYGEditor website={website} onSave={handleSave} />
                    </div>
                    <div>
                      <WebsiteComments websiteId={website.id} />
                    </div>
                  </div>
                </Suspense>
              ) : (
                <Card className="bg-white/5 border-white/20">
                  <CardContent className="p-12 text-center">
                    <p className="text-white">You don't have permission to edit this website</p>
                    <p className="text-gray-400 text-sm mt-2">Contact an admin for editor access</p>
                  </CardContent>
                </Card>
              )}
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="analytics">
            <Suspense fallback={<TabLoader />}>
              <AdvancedAnalyticsDashboard websiteId={website.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="tracking">
            <Suspense fallback={<TabLoader />}>
              <AnalyticsTrackingScript websiteId={website.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="seo">
            <PermissionGuard category="seo" action="run_audits">
              <Suspense fallback={<TabLoader />}>
                <AISeoPowerAudit websiteId={website.id} htmlContent={website.html_content} />
              </Suspense>
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="content">
            <Suspense fallback={<TabLoader />}>
              <SEOContentGenerator
                websiteId={website.id}
                seoAuditData={seoAuditData}
                onContentGenerated={() => toast.success("Content ready! Copy to use in editor.")}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="gaps">
            <Suspense fallback={<TabLoader />}>
              <ContentGapAnalyzer websiteContent={website.html_content} keywords={website.keywords} />
            </Suspense>
          </TabsContent>

          <TabsContent value="meta">
            <Suspense fallback={<TabLoader />}>
              <MetaTagOptimizer
                websiteContent={website.html_content}
                currentTitle={website.title}
                currentDescription={website.description}
                keywords={website.keywords}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="faqs">
            <Suspense fallback={<TabLoader />}>
              <FAQGenerator
                websiteContent={website.html_content}
                pageTitle={website.title}
                keywords={website.keywords}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="linking">
            <Suspense fallback={<TabLoader />}>
              <InternalLinkingSuggestions websiteId={website.id} currentPageContent={website.html_content} />
            </Suspense>
          </TabsContent>

          <TabsContent value="performance">
            <Suspense fallback={<TabLoader />}>
              <CoreWebVitalsAnalyzer websiteId={website.id} htmlContent={website.html_content} />
            </Suspense>
          </TabsContent>

          <TabsContent value="cdn">
            <Suspense fallback={<TabLoader />}>
              <CDNIntegration websiteId={website.id} websiteUrl={website.url} />
            </Suspense>
          </TabsContent>

          <TabsContent value="abtest">
            <PermissionGuard category="ab_testing" action="view">
              <Suspense fallback={<TabLoader />}>
                <ABTestDashboard websiteId={website.id} />
              </Suspense>
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="team">
            <Suspense fallback={<TabLoader />}>
              <WebsiteTeamManager websiteId={website.id} currentUserRole={userRole} />
            </Suspense>
          </TabsContent>

          <TabsContent value="history">
            <Suspense fallback={<TabLoader />}>
              <VersionHistory websiteId={website.id} onRestore={refetch} />
            </Suspense>
          </TabsContent>

          <TabsContent value="metatags">
            <Suspense fallback={<TabLoader />}>
              <MetaTagManager website={website} onUpdate={setWebsite} />
            </Suspense>
          </TabsContent>

          <TabsContent value="sitemap">
            <Suspense fallback={<TabLoader />}>
              <SitemapGenerator websiteId={website.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="onpage">
            <Suspense fallback={<TabLoader />}>
              <OnPageSEOAnalyzer
                htmlContent={website.html_content}
                targetKeyword={website.keywords?.[0] || website.title}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="content-assistant">
            <Suspense fallback={<TabLoader />}>
              <AIContentAssistant website={website} />
            </Suspense>
          </TabsContent>

          <TabsContent value="personalization">
            <Suspense fallback={<TabLoader />}>
              <div className="space-y-4">
                <AIPersonalizationEngine website={website} />
                <SegmentManager websiteId={website.id} />
              </div>
            </Suspense>
          </TabsContent>

          <TabsContent value="deploy">
            <PermissionGuard category="websites" action="publish">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-4">
                  <AdvancedDeploymentHub website={website} />
                  <AdvancedDeploymentSettings website={website} />
                </div>
              </Suspense>
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="ai-seo">
            <Suspense fallback={<TabLoader />}>
              <AISeoPowerTools website={website} />
            </Suspense>
          </TabsContent>

          <TabsContent value="competitor">
            <Suspense fallback={<TabLoader />}>
              <CompetitorAnalyzer website={website} />
            </Suspense>
          </TabsContent>

          <TabsContent value="rankings">
            <Suspense fallback={<TabLoader />}>
              <RankingInsights website={website} />
            </Suspense>
          </TabsContent>

          <TabsContent value="ai-design">
            <Suspense fallback={<TabLoader />}>
              <AIDesignVariations
                selectedElement={{
                  html: website.html_content,
                  type: 'page',
                  selector: 'body'
                }}
                websiteContext={{
                  title: website.title,
                  category: website.category,
                  theme: website.theme,
                  color_scheme: website.color_scheme
                }}
                onVariationApplied={(variation) => {
                  toast.success('Design variation ready - apply in the editor');
                }}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}