/**
 * Deal Intelligence Dashboard
 * Browse all AI-analyzed deals with sorting/filtering by score
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, RefreshCw, Search, TrendingUp, AlertTriangle, Zap, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import DealIntelligencePanel from '../components/deals/DealIntelligencePanel';

export default function DealIntelligence() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('attractiveness_desc');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  // Multi-select filters
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedGeographies, setSelectedGeographies] = useState([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState([]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const allAnalyses = await base44.entities.DealAnalysis.list('-attractiveness_score', 50);
      
      // Enrich with deal data
      const enriched = await Promise.all(
        allAnalyses.map(async (analysis) => {
          const deal = await base44.entities.Deal.get(analysis.deal_id);
          return { ...analysis, deal };
        })
      );
      
      setAnalyses(enriched);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.functions.invoke('bulkAnalyzeDeals', {
        max_concurrent: 5,
      });

      if (response.data?.success) {
        toast.success(
          `Analyzed ${response.data.summary.analyzed} deals (${response.data.summary.cached} cached, ${response.data.summary.failed} failed)`
        );
        loadAnalyses();
      }
    } catch (error) {
      toast.error('Bulk analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Extract unique filter options
  const uniqueIndustries = [...new Set(analyses.map(a => a.deal?.industry).filter(Boolean))];
  const uniqueStages = [...new Set(analyses.map(a => a.deal?.stage).filter(Boolean))];
  const uniqueGeographies = [...new Set(analyses.map(a => a.deal?.geography).filter(Boolean))];

  const filteredAnalyses = analyses
    .filter(a => {
      // Advanced search across multiple fields
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          a.deal?.company_name,
          a.deal?.industry,
          a.deal?.description,
          a.ai_summary,
          ...(a.risk_factors?.map(r => r.description) || []),
          ...(a.opportunities?.map(o => o.description) || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      // Multi-select filters
      if (selectedIndustries.length > 0 && !selectedIndustries.includes(a.deal?.industry)) return false;
      if (selectedStages.length > 0 && !selectedStages.includes(a.deal?.stage)) return false;
      if (selectedGeographies.length > 0 && !selectedGeographies.includes(a.deal?.geography)) return false;
      if (selectedRiskLevels.length > 0) {
        const hasRiskLevel = a.risk_factors?.some(r => selectedRiskLevels.includes(r.severity));
        if (!hasRiskLevel) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'attractiveness_desc':
          return b.attractiveness_score - a.attractiveness_score;
        case 'attractiveness_asc':
          return a.attractiveness_score - b.attractiveness_score;
        case 'success_prob_desc':
          return (b.success_probability || 0) - (a.success_probability || 0);
        case 'growth_desc':
          return (b.growth_velocity?.revenue_cagr || 0) - (a.growth_velocity?.revenue_cagr || 0);
        case 'funding_velocity_desc':
          return (a.growth_velocity?.funding_velocity || 999) - (b.growth_velocity?.funding_velocity || 999);
        case 'valuation_multiple_desc':
          const aMultiple = (a.deal?.valuation || 0) / (a.deal?.revenue_ttm || 1);
          const bMultiple = (b.deal?.valuation || 0) / (b.deal?.revenue_ttm || 1);
          return bMultiple - aMultiple;
        default:
          return 0;
      }
    });

  const toggleFilter = (value, selectedArray, setFunction) => {
    if (selectedArray.includes(value)) {
      setFunction(selectedArray.filter(v => v !== value));
    } else {
      setFunction([...selectedArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedIndustries([]);
    setSelectedStages([]);
    setSelectedGeographies([]);
    setSelectedRiskLevels([]);
  };

  const activeFiltersCount = selectedIndustries.length + selectedStages.length + selectedGeographies.length + selectedRiskLevels.length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Deal Intelligence</h1>
              <p className="text-gray-400">AI-powered analysis of {analyses.length} deals</p>
            </div>
          </div>

          <Button
            onClick={handleBulkAnalyze}
            disabled={analyzing}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze All Deals
              </>
            )}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Avg Attractiveness</p>
              <p className="text-2xl font-bold text-white">
                {(analyses.reduce((sum, a) => sum + a.attractiveness_score, 0) / analyses.length || 0).toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">High-Quality Deals</p>
              <p className="text-2xl font-bold text-green-400">
                {analyses.filter(a => a.attractiveness_score >= 75).length}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Total Risks Identified</p>
              <p className="text-2xl font-bold text-red-400">
                {analyses.reduce((sum, a) => sum + (a.risk_factors?.length || 0), 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Total Opportunities</p>
              <p className="text-2xl font-bold text-blue-400">
                {analyses.reduce((sum, a) => sum + (a.opportunities?.length || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search & Filters */}
        <Card className="glass border-white/10">
          <CardContent className="p-4 space-y-4">
            {/* Search & Sort Row */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search deals, summaries, risks, opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attractiveness_desc">Highest Attractiveness</SelectItem>
                  <SelectItem value="attractiveness_asc">Lowest Attractiveness</SelectItem>
                  <SelectItem value="success_prob_desc">Highest Success Probability</SelectItem>
                  <SelectItem value="growth_desc">Highest Growth Rate</SelectItem>
                  <SelectItem value="funding_velocity_desc">Fastest Funding Velocity</SelectItem>
                  <SelectItem value="valuation_multiple_desc">Highest Valuation Multiple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Multi-Select Filters */}
            <div className="grid md:grid-cols-4 gap-4">
              {/* Industry Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Industry
                  </label>
                  {selectedIndustries.length > 0 && (
                    <button
                      onClick={() => setSelectedIndustries([])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uniqueIndustries.map(industry => (
                    <label key={industry} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <Checkbox
                        checked={selectedIndustries.includes(industry)}
                        onCheckedChange={() => toggleFilter(industry, selectedIndustries, setSelectedIndustries)}
                      />
                      {industry}
                    </label>
                  ))}
                </div>
              </div>

              {/* Stage Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Stage
                  </label>
                  {selectedStages.length > 0 && (
                    <button
                      onClick={() => setSelectedStages([])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {uniqueStages.map(stage => (
                    <label key={stage} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <Checkbox
                        checked={selectedStages.includes(stage)}
                        onCheckedChange={() => toggleFilter(stage, selectedStages, setSelectedStages)}
                      />
                      {stage}
                    </label>
                  ))}
                </div>
              </div>

              {/* Geography Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Geography
                  </label>
                  {selectedGeographies.length > 0 && (
                    <button
                      onClick={() => setSelectedGeographies([])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uniqueGeographies.map(geo => (
                    <label key={geo} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <Checkbox
                        checked={selectedGeographies.includes(geo)}
                        onCheckedChange={() => toggleFilter(geo, selectedGeographies, setSelectedGeographies)}
                      />
                      {geo}
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Risk Severity
                  </label>
                  {selectedRiskLevels.length > 0 && (
                    <button
                      onClick={() => setSelectedRiskLevels([])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {['low', 'medium', 'high', 'critical'].map(level => (
                    <label key={level} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <Checkbox
                        checked={selectedRiskLevels.includes(level)}
                        onCheckedChange={() => toggleFilter(level, selectedRiskLevels, setSelectedRiskLevels)}
                      />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Badge variant="outline" className="text-xs">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 text-xs text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnalyses.map(analysis => (
            <Card
              key={analysis.id}
              className="glass border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-base mb-1">
                      {analysis.deal?.company_name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {analysis.deal?.industry}
                    </Badge>
                  </div>
                  
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{analysis.attractiveness_score}</div>
                      <div className="text-[7px] text-white/80">SCORE</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* AI Summary */}
                <p className="text-sm text-gray-300 line-clamp-2">{analysis.ai_summary}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Success Prob</p>
                    <p className="text-green-400 font-semibold">
                      {(analysis.success_probability * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Growth Rate</p>
                    <p className="text-blue-400 font-semibold">
                      {analysis.growth_velocity?.revenue_cagr?.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Risk/Opp Count */}
                <div className="flex gap-2">
                  {analysis.risk_factors?.length > 0 && (
                    <Badge variant="destructive" className="text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {analysis.risk_factors.length} risks
                    </Badge>
                  )}
                  {analysis.opportunities?.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {analysis.opportunities.length} opps
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnalyses.length === 0 && !loading && (
          <Card className="glass border-white/10">
            <CardContent className="p-12 text-center">
              <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No analyses found. Click "Analyze All Deals" to start.</p>
            </CardContent>
          </Card>
        )}

        {/* Detail Modal */}
        {selectedAnalysis && (
          <Dialog open onOpenChange={() => setSelectedAnalysis(null)}>
            <DialogContent className="glass border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">
                  {selectedAnalysis.deal?.company_name} - Intelligence Report
                </DialogTitle>
              </DialogHeader>
              
              <DealIntelligencePanel analysis={selectedAnalysis} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}