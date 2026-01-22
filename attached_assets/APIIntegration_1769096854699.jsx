import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, Key, BookOpen, Zap, Copy, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import APIKeyManager from "../components/api/APIKeyManager";

const TOP_10_APIS = [
  {
    rank: 1,
    name: "AI Website Generator",
    endpoint: "POST /ai/generate-website",
    description: "Generate complete websites from natural language descriptions",
    method: "POST",
    example: `{
  "prompt": "Modern SaaS landing page for project management tool",
  "category": "business",
  "theme": "modern",
  "color_scheme": "blue",
  "language": "en",
  "include_animations": true
}`,
    response: `{
  "website_id": "ws_abc123",
  "title": "ProjectFlow - Manage Smarter",
  "html_content": "<!DOCTYPE html>...",
  "seo_score": 87,
  "generation_time_ms": 4500
}`
  },
  {
    rank: 2,
    name: "SEO Analysis",
    endpoint: "POST /seo/analyze",
    description: "AI-powered comprehensive SEO audit with actionable recommendations",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "depth": "comprehensive",
  "include_competitor_analysis": true
}`,
    response: `{
  "audit_id": "aud_xyz789",
  "overall_score": 78,
  "critical_issues": [...],
  "quick_wins": [...],
  "keyword_strategy": {...}
}`
  },
  {
    rank: 3,
    name: "Deploy Website",
    endpoint: "POST /deploy",
    description: "Deploy websites to Vercel, Netlify, Cloudflare, or custom hosting",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "provider": "vercel",
  "environment": "production",
  "domain": "mysite.com"
}`,
    response: `{
  "deployment_id": "dep_123",
  "status": "deploying",
  "deployed_url": "https://mysite.vercel.app",
  "estimated_time_seconds": 45
}`
  },
  {
    rank: 4,
    name: "Competitor Analysis",
    endpoint: "POST /seo/competitor-analyze",
    description: "Deep competitive analysis with gap identification and opportunities",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "competitor_url": "https://competitor.com",
  "analysis_depth": "full"
}`,
    response: `{
  "competitor_name": "Competitor Inc",
  "strengths": [...],
  "weaknesses": [...],
  "content_gaps": [...],
  "target_keywords": [...]
}`
  },
  {
    rank: 5,
    name: "A/B Test Creation",
    endpoint: "POST /ab-tests",
    description: "Create and manage A/B tests with AI-generated variants",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "test_name": "Hero CTA Test",
  "test_type": "cta",
  "hypothesis": "Green CTA will increase conversions",
  "variants": [
    { "name": "Control", "traffic_percent": 50 },
    { "name": "Green CTA", "traffic_percent": 50 }
  ]
}`,
    response: `{
  "test_id": "ab_test123",
  "status": "running",
  "tracking_script": "<script>..."
}`
  },
  {
    rank: 6,
    name: "Content Generation",
    endpoint: "POST /content/generate",
    description: "AI-powered SEO content generation for pages, blogs, and meta tags",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "content_type": "blog_post",
  "topic": "10 Best Project Management Tips",
  "target_keywords": ["project management", "productivity"],
  "word_count": 1500
}`,
    response: `{
  "content_id": "cnt_456",
  "title": "10 Project Management Tips...",
  "html_content": "<article>...",
  "meta_description": "Discover...",
  "readability_score": 72
}`
  },
  {
    rank: 7,
    name: "Analytics Events",
    endpoint: "POST /analytics/track",
    description: "Track page views, clicks, conversions, and custom events",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "event_type": "conversion",
  "session_id": "sess_789",
  "page_url": "/pricing",
  "metadata": { "plan": "pro" }
}`,
    response: `{
  "event_id": "evt_abc",
  "recorded_at": "2024-01-15T10:30:00Z"
}`
  },
  {
    rank: 8,
    name: "Get Analytics Dashboard",
    endpoint: "GET /analytics/:website_id/dashboard",
    description: "Retrieve aggregated analytics with insights and trends",
    method: "GET",
    example: `// Query params:
?period=30d&metrics=views,conversions,bounce_rate`,
    response: `{
  "total_views": 15420,
  "unique_visitors": 8930,
  "conversions": 342,
  "bounce_rate": 0.42,
  "top_pages": [...],
  "traffic_sources": [...],
  "ai_insights": [...]
}`
  },
  {
    rank: 9,
    name: "Keyword Research",
    endpoint: "POST /seo/keywords",
    description: "AI-powered keyword research with search volume and difficulty",
    method: "POST",
    example: `{
  "seed_keywords": ["project management"],
  "industry": "SaaS",
  "location": "US",
  "limit": 50
}`,
    response: `{
  "keywords": [
    {
      "keyword": "project management software",
      "search_volume": 22000,
      "difficulty": 67,
      "opportunity_score": 78
    }
  ],
  "clusters": [...]
}`
  },
  {
    rank: 10,
    name: "Website Redesign",
    endpoint: "POST /ai/redesign",
    description: "AI-powered website redesign with before/after comparison",
    method: "POST",
    example: `{
  "website_id": "ws_abc123",
  "redesign_goals": ["modernize", "improve_conversion"],
  "preserve_content": true,
  "style": "minimal"
}`,
    response: `{
  "redesign_id": "rd_789",
  "original_html": "...",
  "redesigned_html": "...",
  "changes_summary": [...],
  "estimated_improvement": { "ux": "+35%", "seo": "+12%" }
}`
  }
];

export default function APIIntegration() {
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="text-gray-300 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Code className="w-8 h-8 text-indigo-400" />
            API Integration
          </h1>
          <p className="text-gray-300">
            Integrate WebCraft AI into your workflows with our REST API
          </p>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="bg-white/5">
            <TabsTrigger value="top10">
              <Zap className="w-4 h-4 mr-2" />
              Top 10 APIs
            </TabsTrigger>
            <TabsTrigger value="keys">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="docs">
              <BookOpen className="w-4 h-4 mr-2" />
              Full Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top10">
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2">🚀 Top 10 Essential APIs</h2>
                  <p className="text-gray-300 text-sm">
                    Production-ready endpoints for AI website generation, SEO optimization, deployments, and analytics.
                    All endpoints require Bearer token authentication.
                  </p>
                  <div className="mt-4 p-3 bg-black/30 rounded-lg">
                    <code className="text-xs text-gray-300">
                      Authorization: Bearer wc_your_api_key
                    </code>
                  </div>
                </CardContent>
              </Card>

              {TOP_10_APIS.map((api) => (
                <Card key={api.rank} className="bg-white/5 border-white/20 hover:bg-white/10 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {api.rank}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{api.name}</CardTitle>
                          <p className="text-gray-400 text-sm mt-1">{api.description}</p>
                        </div>
                      </div>
                      <Badge className={api.method === "POST" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                        {api.method}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-black/30 rounded text-sm text-indigo-300 font-mono">
                        {api.endpoint}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`https://api.webcraft.ai/v1${api.endpoint.split(" ")[1] || api.endpoint}`, api.rank)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedEndpoint === api.rank ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-2 font-semibold">REQUEST BODY</p>
                        <pre className="bg-black/40 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-40">
                          {api.example}
                        </pre>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2 font-semibold">RESPONSE</p>
                        <pre className="bg-black/40 p-3 rounded-lg text-xs text-green-300 overflow-x-auto max-h-40">
                          {api.response}
                        </pre>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-gray-500 text-xs">
                        <strong>cURL:</strong>{" "}
                        <code className="text-gray-400">
                          curl -X {api.method} -H "Authorization: Bearer $API_KEY" -H "Content-Type: application/json" https://api.webcraft.ai/v1{api.endpoint.replace(/^(POST|GET|PUT|DELETE)\s/, "")}
                        </code>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keys">
            <APIKeyManager />
          </TabsContent>

          <TabsContent value="docs">
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Authentication</h3>
                    <p className="text-gray-300 text-sm mb-2">
                      Include your API key in the Authorization header:
                    </p>
                    <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto">
{`Authorization: Bearer wc_your_api_key_here`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Base URL</h3>
                    <pre className="bg-black/30 p-3 rounded text-xs text-gray-300">
{`https://api.webcraft.ai/v1`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Websites</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">GET /websites</span>
                          <span className="text-xs text-gray-400">List websites</span>
                        </div>
                        <pre className="text-xs text-gray-400 mt-2">
{`curl -H "Authorization: Bearer $API_KEY" \\
  https://api.webcraft.ai/v1/websites`}
                        </pre>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">POST /websites</span>
                          <span className="text-xs text-gray-400">Create website</span>
                        </div>
                        <pre className="text-xs text-gray-400 mt-2">
{`curl -X POST -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Website",
    "description": "A great site",
    "category": "business"
  }' https://api.webcraft.ai/v1/websites`}
                        </pre>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">GET /websites/:id</span>
                          <span className="text-xs text-gray-400">Get website</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">PUT /websites/:id</span>
                          <span className="text-xs text-gray-400">Update website</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">DELETE /websites/:id</span>
                          <span className="text-xs text-gray-400">Delete website</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">A/B Testing</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">GET /ab-tests</span>
                          <span className="text-xs text-gray-400">List tests</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">POST /ab-tests</span>
                          <span className="text-xs text-gray-400">Create test</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">GET /ab-tests/:id/results</span>
                          <span className="text-xs text-gray-400">Get results</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">SEO Audits</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">POST /seo/audit</span>
                          <span className="text-xs text-gray-400">Run audit</span>
                        </div>
                        <pre className="text-xs text-gray-400 mt-2">
{`curl -X POST -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"website_id": "abc123"}' \\
  https://api.webcraft.ai/v1/seo/audit`}
                        </pre>
                      </div>

                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">GET /seo/audits/:id</span>
                          <span className="text-xs text-gray-400">Get audit results</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Analytics</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-mono text-sm">GET /analytics/:website_id</span>
                          <span className="text-xs text-gray-400">Get analytics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Rate Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-2">
                    Default: 1,000 requests per hour per API key
                  </p>
                  <p className="text-gray-400 text-xs">
                    Rate limit info is returned in response headers:
                  </p>
                  <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 mt-2">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Error Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-mono">200</span>
                      <span className="text-gray-300">Success</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-mono">400</span>
                      <span className="text-gray-300">Bad Request</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-mono">401</span>
                      <span className="text-gray-300">Unauthorized (invalid key)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-mono">403</span>
                      <span className="text-gray-300">Forbidden (insufficient permissions)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-mono">429</span>
                      <span className="text-gray-300">Rate Limit Exceeded</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-mono">500</span>
                      <span className="text-gray-300">Server Error</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}