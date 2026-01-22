import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Users, TrendingUp, Sparkles } from 'lucide-react';
import IntelligentPersonalizationEngine from '@/components/personalization/IntelligentPersonalizationEngine';
import SegmentManager from '@/components/personalization/SegmentManager';
import WebsiteSelector from '@/components/shared/WebsiteSelector';
import { toast } from 'sonner';

/**
 * Personalization Engine Dashboard
 * Central hub for AI-powered content personalization
 */

export default function PersonalizationEngine() {
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const data = await base44.entities.Website.list();
      setWebsites(data);
      if (data.length > 0) {
        setSelectedWebsite(data[0]);
      }
    } catch (error) {
      toast.error('Failed to load websites');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading personalization engine...</div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <Card className="glass border-white/10 max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-bold text-white mb-2">No Websites Found</h2>
            <p className="text-gray-400 mb-6">
              Create a website first to use personalization features
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Create Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Personalization Engine - WebCraft AI</title>
        <meta name="description" content="AI-powered content personalization with machine learning" />
      </Helmet>

      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                AI Personalization Engine
              </h1>
              <p className="text-gray-400">
                Dynamic content adaptation with machine learning capabilities
              </p>
            </div>

            <WebsiteSelector
              websites={websites}
              selectedWebsite={selectedWebsite}
              onSelect={setSelectedWebsite}
            />
          </div>

          {/* Feature Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass border-white/10 border-purple-500/20">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Segment Targeting</h3>
                <p className="text-sm text-gray-400">
                  Define user segments based on behavior, demographics, and preferences
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 border-blue-500/20">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">AI Content Generation</h3>
                <p className="text-sm text-gray-400">
                  Automatically generate personalized content for each segment
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 border-green-500/20">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Continuous Learning</h3>
                <p className="text-sm text-gray-400">
                  ML engine analyzes performance and refines strategies over time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="engine" className="space-y-4">
            <TabsList className="glass border-white/10">
              <TabsTrigger value="engine">
                <Brain className="w-4 h-4 mr-2" />
                Personalization Engine
              </TabsTrigger>
              <TabsTrigger value="segments">
                <Users className="w-4 h-4 mr-2" />
                Segment Manager
              </TabsTrigger>
            </TabsList>

            <TabsContent value="engine">
              {selectedWebsite && (
                <IntelligentPersonalizationEngine websiteId={selectedWebsite.id} />
              )}
            </TabsContent>

            <TabsContent value="segments">
              {selectedWebsite && (
                <SegmentManager websiteId={selectedWebsite.id} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}