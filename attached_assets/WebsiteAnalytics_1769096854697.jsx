import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, MousePointer, Target } from 'lucide-react';
import { api } from '@/components/services/api';
import { toast } from 'sonner';
import useWebsitesData from '@/components/hooks/useWebsitesData';
import MetricsOverview from '@/components/analytics/dashboard/MetricsOverview';
import TrafficSourcesChart from '@/components/analytics/dashboard/TrafficSourcesChart';
import TemplatePerformanceTable from '@/components/analytics/dashboard/TemplatePerformanceTable';
import ConversionFunnelAnalyzer from '@/components/analytics/dashboard/ConversionFunnelAnalyzer';
import DateRangePicker from '@/components/analytics/dashboard/DateRangePicker';
import { format, subDays } from 'date-fns';

export default function WebsiteAnalytics() {
  const { websites, isLoading: websitesLoading } = useWebsitesData();
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (websites.length > 0 && !selectedWebsite) {
      setSelectedWebsite(websites[0].id);
    }
  }, [websites, selectedWebsite]);

  useEffect(() => {
    if (selectedWebsite) {
      loadAnalytics();
    }
  }, [selectedWebsite, dateRange]);

  const loadAnalytics = async () => {
    if (!selectedWebsite) return;

    setIsLoading(true);
    try {
      const [events, aggregates, abTests] = await Promise.all([
        api.analytics.getEvents(selectedWebsite, '-created_date', 1000),
        api.analytics.getInsights(selectedWebsite),
        api.abTests.getByWebsite(selectedWebsite)
      ]);

      // Calculate metrics from events
      const metrics = calculateMetrics(events, dateRange);
      const trafficSources = analyzeTrafficSources(events);
      const demographics = analyzeDemographics(events);
      const templatePerformance = await analyzeTemplatePerformance();
      
      setAnalyticsData({
        metrics,
        trafficSources,
        demographics,
        events: events.slice(0, 100),
        abTests,
        templatePerformance
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (events, range) => {
    const filteredEvents = events.filter(e => {
      const eventDate = new Date(e.created_date);
      return eventDate >= range.from && eventDate <= range.to;
    });

    const uniqueVisitors = new Set(filteredEvents.map(e => e.visitor_id || e.session_id)).size;
    const pageviews = filteredEvents.filter(e => e.event_type === 'pageview').length;
    const conversions = filteredEvents.filter(e => e.event_type === 'conversion').length;
    
    // Calculate bounce rate (sessions with only 1 pageview)
    const sessionPageviews = {};
    filteredEvents.forEach(e => {
      const sessionId = e.session_id;
      if (e.event_type === 'pageview') {
        sessionPageviews[sessionId] = (sessionPageviews[sessionId] || 0) + 1;
      }
    });
    const sessions = Object.keys(sessionPageviews).length;
    const bounced = Object.values(sessionPageviews).filter(count => count === 1).length;
    const bounceRate = sessions > 0 ? (bounced / sessions) * 100 : 0;

    const conversionRate = pageviews > 0 ? (conversions / pageviews) * 100 : 0;

    // Calculate previous period for comparison
    const periodLength = range.to - range.from;
    const previousStart = new Date(range.from - periodLength);
    const previousEnd = range.from;
    
    const prevEvents = events.filter(e => {
      const eventDate = new Date(e.created_date);
      return eventDate >= previousStart && eventDate < previousEnd;
    });
    
    const prevVisitors = new Set(prevEvents.map(e => e.visitor_id || e.session_id)).size;
    const prevPageviews = prevEvents.filter(e => e.event_type === 'pageview').length;
    
    return {
      uniqueVisitors,
      pageviews,
      bounceRate,
      conversions,
      conversionRate,
      avgSessionDuration: 185, // seconds (would calculate from event timestamps)
      changes: {
        visitors: prevVisitors > 0 ? ((uniqueVisitors - prevVisitors) / prevVisitors) * 100 : 0,
        pageviews: prevPageviews > 0 ? ((pageviews - prevPageviews) / prevPageviews) * 100 : 0
      }
    };
  };

  const analyzeTrafficSources = (events) => {
    const sources = {};
    events.forEach(e => {
      const source = e.properties?.referrer_source || 'direct';
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  };

  const analyzeDemographics = (events) => {
    const countries = {};
    const devices = {};
    
    events.forEach(e => {
      const country = e.properties?.country || 'Unknown';
      const device = e.properties?.device_type || 'desktop';
      
      countries[country] = (countries[country] || 0) + 1;
      devices[device] = (devices[device] || 0) + 1;
    });

    return {
      countries: Object.entries(countries)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      devices: Object.entries(devices)
        .map(([device, count]) => ({ device, count }))
    };
  };

  const analyzeTemplatePerformance = async () => {
    const allWebsites = await api.websites.list('-created_date', 100);
    const templateStats = {};

    allWebsites.forEach(site => {
      const templateId = site.template_id || 'custom';
      if (!templateStats[templateId]) {
        templateStats[templateId] = {
          templateId,
          name: site.template_id ? `Template ${templateId}` : 'Custom',
          deployments: 0,
          avgQuality: 0,
          conversions: 0
        };
      }
      
      templateStats[templateId].deployments++;
      templateStats[templateId].avgQuality += site.quality_score || 0;
    });

    return Object.values(templateStats)
      .map(stat => ({
        ...stat,
        avgQuality: stat.avgQuality / stat.deployments
      }))
      .sort((a, b) => b.deployments - a.deployments);
  };

  const exportReport = async () => {
    toast.loading('Generating report...', { id: 'export' });
    
    try {
      const reportData = {
        website: websites.find(w => w.id === selectedWebsite)?.title || 'Website',
        period: `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
        metrics: analyticsData.metrics,
        trafficSources: analyticsData.trafficSources,
        demographics: analyticsData.demographics
      };

      const csvContent = generateCSV(reportData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report downloaded', { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const generateCSV = (data) => {
    let csv = `Website Analytics Report\n`;
    csv += `Website: ${data.website}\n`;
    csv += `Period: ${data.period}\n\n`;
    csv += `Metric,Value\n`;
    csv += `Unique Visitors,${data.metrics.uniqueVisitors}\n`;
    csv += `Page Views,${data.metrics.pageviews}\n`;
    csv += `Bounce Rate,${data.metrics.bounceRate.toFixed(2)}%\n`;
    csv += `Conversions,${data.metrics.conversions}\n`;
    csv += `Conversion Rate,${data.metrics.conversionRate.toFixed(2)}%\n\n`;
    csv += `Traffic Sources\n`;
    csv += `Source,Visits\n`;
    data.trafficSources.forEach(s => {
      csv += `${s.source},${s.count}\n`;
    });
    return csv;
  };

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - WebCraft AI</title>
      </Helmet>

      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
              <p className="text-gray-400 mt-1">Track performance and optimize conversions</p>
            </div>
            <div className="flex gap-2">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Website Selector */}
          {!websitesLoading && websites.length > 0 && (
            <Card className="glass border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <label className="text-gray-400 text-sm">Website:</label>
                  <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                    <SelectTrigger className="w-[300px] bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {websites.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="glass border-white/10 h-32 animate-pulse" />
              ))}
            </div>
          ) : analyticsData ? (
            <>
              {/* Key Metrics */}
              <MetricsOverview metrics={analyticsData.metrics} />

              {/* Detailed Analytics Tabs */}
              <Tabs defaultValue="traffic" className="space-y-4">
                <TabsList className="glass">
                  <TabsTrigger value="traffic">
                    <Users className="w-4 h-4 mr-2" />
                    Traffic & Sources
                  </TabsTrigger>
                  <TabsTrigger value="templates">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Template Performance
                  </TabsTrigger>
                  <TabsTrigger value="funnel">
                    <Target className="w-4 h-4 mr-2" />
                    Conversion Funnels
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="traffic">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <TrafficSourcesChart 
                      data={analyticsData.trafficSources}
                      demographics={analyticsData.demographics}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="templates">
                  <TemplatePerformanceTable 
                    data={analyticsData.templatePerformance}
                    abTests={analyticsData.abTests}
                  />
                </TabsContent>

                <TabsContent value="funnel">
                  <ConversionFunnelAnalyzer 
                    websiteId={selectedWebsite}
                    dateRange={dateRange}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="glass border-white/10 p-12 text-center">
              <MousePointer className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Select a website to view analytics</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}