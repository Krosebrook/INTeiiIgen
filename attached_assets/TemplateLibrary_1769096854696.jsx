import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Sparkles, Filter } from 'lucide-react';
import { api } from '@/components/services/api';
import { toast } from 'sonner';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal';
import SaveTemplateModal from '@/components/templates/SaveTemplateModal';
import TemplateFilters from '@/components/templates/TemplateFilters';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { motion } from 'framer-motion';
import ProductTour from '@/components/onboarding/ProductTour';
import TourTrigger from '@/components/onboarding/TourTrigger';
import { useTour } from '@/components/onboarding/useTour';
import { templatesTour } from '@/components/onboarding/tours/templatesTour';

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '🎨' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛍️' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'saas', label: 'SaaS', icon: '🚀' },
  { id: 'blog', label: 'Blog', icon: '📝' },
  { id: 'landing', label: 'Landing Page', icon: '🎯' },
  { id: 'business', label: 'Business', icon: '🏢' },
  { id: 'agency', label: 'Agency', icon: '✨' }
];

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filters, setFilters] = useState({
    theme: 'all',
    color_scheme: 'all',
    sort: 'popular'
  });
  
  const { isOpen: tourOpen, startTour, completeTour, skipTour, hasCompleted } = useTour('templates', true);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, searchQuery, activeCategory, filters]);

  const loadTemplates = async () => {
    try {
      const data = await api.templates.getPublic();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.industry?.toLowerCase().includes(query)
      );
    }

    // Theme filter
    if (filters.theme !== 'all') {
      filtered = filtered.filter(t => t.theme === filters.theme);
    }

    // Color scheme filter
    if (filters.color_scheme !== 'all') {
      filtered = filtered.filter(t => t.color_scheme === filters.color_scheme);
    }

    // Sort
    if (filters.sort === 'popular') {
      filtered.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    } else if (filters.sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (filters.sort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = async (template) => {
    try {
      await api.templates.incrementUsage(template.id);
      
      const website = await api.websites.create({
        title: `${template.name} - New Project`,
        description: template.description || '',
        category: template.category,
        theme: template.theme,
        html_content: template.template_html,
        status: 'draft',
        template_id: template.id
      });

      toast.success('Template applied successfully!');
      window.location.href = `/website-editor?id=${website.id}`;
    } catch (error) {
      toast.error('Failed to apply template');
    }
  };

  const handleGenerateAITemplates = async () => {
    toast.loading('Generating AI templates...', { id: 'gen' });
    try {
      const prompt = `Generate 3 unique, production-grade website template descriptions for:
      - E-commerce fashion store
      - SaaS project management tool
      - Creative agency portfolio
      
      For each, provide: name, description, industry, key features, color scheme, and target audience.`;

      const result = await api.integrations.invokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            templates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  industry: { type: "string" },
                  theme: { type: "string" },
                  color_scheme: { type: "string" }
                }
              }
            }
          }
        }
      });

      toast.success(`Generated ${result.templates.length} templates`, { id: 'gen' });
      loadTemplates();
    } catch (error) {
      toast.error('Generation failed', { id: 'gen' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Template Library - WebCraft AI</title>
      </Helmet>

      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Template Library</h1>
              <p className="text-gray-400 mt-1">Browse and customize professional templates</p>
            </div>
            <div className="flex items-center gap-2">
              <TourTrigger onClick={startTour} hasCompleted={hasCompleted} />
              <PermissionGuard permission="templates.create" showLocked={false}>
                <Button
                  onClick={() => setShowSaveModal(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save Custom
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="templates.create" showLocked={false}>
                <Button
                  onClick={handleGenerateAITemplates}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Templates
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4" data-tour="template-filters">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <TemplateFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="glass">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <span>{cat.icon}</span>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="glass h-80 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="glass p-12 rounded-lg text-center">
                  <Filter className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No templates found</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                      setFilters({ theme: 'all', color_scheme: 'all', sort: 'popular' });
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-tour="template-gallery"
                >
                {filteredTemplates.map((template, idx) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={() => setPreviewTemplate(template)}
                    onUse={() => handleUseTemplate(template)}
                    showTourMarker={idx === 0}
                  />
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
      />

      <SaveTemplateModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={loadTemplates}
      />
      
      <ProductTour
        steps={templatesTour}
        isOpen={tourOpen}
        onComplete={completeTour}
        onSkip={skipTour}
        tourKey="templates"
      />
    </>
  );
}