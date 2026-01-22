import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye, Save, Download, Sparkles } from 'lucide-react';
import ComponentPalette from '@/components/pageBuilder/ComponentPalette';
import BuilderCanvas from '@/components/pageBuilder/BuilderCanvas';
import StyleEditor from '@/components/pageBuilder/StyleEditor';
import AIContentModal from '@/components/pageBuilder/AIContentModal';
import AIDesignVariations from '@/components/ai/AIDesignVariations';
import { generateHTML } from '@/components/pageBuilder/htmlGenerator';
import { toast } from 'sonner';
import { websitesApi } from '@/components/services/api';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';

const INITIAL_COMPONENTS = [
  {
    id: 'hero-1',
    type: 'hero',
    content: { title: 'Welcome to Our Platform', subtitle: 'Build amazing websites with AI', cta: 'Get Started' },
    styles: { bg: 'gradient-to-r from-purple-600 to-blue-600', textColor: 'white', padding: 'py-20' }
  }
];

export default function PageBuilder() {
  const { t } = useTranslation();
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [view, setView] = useState('design'); // design | code | preview
  const [isSaving, setIsSaving] = useState(false);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Reorder components
    if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      const newComponents = Array.from(components);
      const [reordered] = newComponents.splice(source.index, 1);
      newComponents.splice(destination.index, 0, reordered);
      setComponents(newComponents);
      return;
    }

    // Add from palette
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const componentType = result.draggableId;
      const newComponent = createComponentFromType(componentType);
      const newComponents = Array.from(components);
      newComponents.splice(destination.index, 0, newComponent);
      setComponents(newComponents);
      toast.success('Component added');
    }
  }, [components]);

  const createComponentFromType = (type) => {
    const id = `${type}-${Date.now()}`;
    const templates = {
      hero: {
        id,
        type: 'hero',
        content: { title: 'Hero Title', subtitle: 'Hero subtitle text', cta: 'Call to Action' },
        styles: { bg: 'bg-slate-900', textColor: 'text-white', padding: 'py-20' }
      },
      features: {
        id,
        type: 'features',
        content: {
          title: 'Key Features',
          items: [
            { icon: '⚡', title: 'Fast', description: 'Lightning-fast performance' },
            { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
            { icon: '🎨', title: 'Beautiful', description: 'Stunning visual design' }
          ]
        },
        styles: { bg: 'bg-white', textColor: 'text-slate-900', padding: 'py-16' }
      },
      cta: {
        id,
        type: 'cta',
        content: { title: 'Ready to get started?', subtitle: 'Join thousands of users', buttonText: 'Start Free Trial' },
        styles: { bg: 'bg-gradient-to-r from-indigo-600 to-purple-600', textColor: 'text-white', padding: 'py-12' }
      },
      text: {
        id,
        type: 'text',
        content: { text: '<p>Your content here...</p>' },
        styles: { bg: 'bg-white', textColor: 'text-slate-900', padding: 'py-8' }
      },
      image: {
        id,
        type: 'image',
        content: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200', alt: 'Hero image' },
        styles: { height: 'h-96', objectFit: 'object-cover' }
      }
    };
    return templates[type] || templates.text;
  };

  const updateComponent = useCallback((id, updates) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteComponent = useCallback((id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedComponent?.id === id) setSelectedComponent(null);
    toast.success('Component deleted');
  }, [selectedComponent]);

  const duplicateComponent = useCallback((id) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const duplicate = { ...component, id: `${component.type}-${Date.now()}` };
      const index = components.findIndex(c => c.id === id);
      const newComponents = [...components];
      newComponents.splice(index + 1, 0, duplicate);
      setComponents(newComponents);
      toast.success('Component duplicated');
    }
  }, [components]);

  const insertAIContent = useCallback((componentType, content) => {
    const newComponent = createComponentFromType(componentType);
    newComponent.content = { ...newComponent.content, ...content };
    setComponents(prev => [...prev, newComponent]);
    setShowAIModal(false);
    toast.success('AI content inserted');
  }, []);

  const applyDesignVariation = useCallback((variation) => {
    if (!selectedComponent) return;
    
    // Parse and apply the variation's implementation
    const impl = variation.implementation;
    
    // Update component with new design
    const updates = {
      ...selectedComponent,
      styles: {
        ...selectedComponent.styles,
        ...(impl.colors && { colors: impl.colors }),
        ...(impl.fonts && { fonts: impl.fonts }),
      }
    };
    
    // If HTML is provided, update content
    if (impl.html) {
      updates.content = {
        ...selectedComponent.content,
        customHTML: impl.html
      };
    }
    
    updateComponent(selectedComponent.id, updates);
    toast.success('Design variation applied');
  }, [selectedComponent, updateComponent]);

  const saveDesign = async () => {
    setIsSaving(true);
    try {
      const html = generateHTML(components);
      const website = await websitesApi.create({
        title: 'Page Builder Design',
        html_content: html,
        category: 'custom',
        design_data: { components }
      });
      toast.success('Design saved successfully');
    } catch (error) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportHTML = () => {
    const html = generateHTML(components);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-design.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported');
  };

  const generatedHTML = generateHTML(components);

  return (
    <PageContainer maxWidth="full" animate={false}>
      <PageHeader
        title="Visual Page Builder"
        description="Drag, drop, and customize components to build your page"
        icon={Code}
      />

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Component Palette */}
        <div className="w-64 flex-shrink-0">
          <ComponentPalette />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Tabs value={view} onValueChange={setView} className="w-auto">
              <TabsList>
                <TabsTrigger value="design">
                  <Eye className="w-4 h-4 mr-2" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAIModal(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Content
              </Button>
              <Button variant="outline" onClick={exportHTML}>
                <Download className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
              <Button onClick={saveDesign} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <Card className="flex-1 overflow-auto bg-white">
            {view === 'design' && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <BuilderCanvas
                  components={components}
                  selectedComponent={selectedComponent}
                  onSelectComponent={setSelectedComponent}
                  onUpdateComponent={updateComponent}
                  onDeleteComponent={deleteComponent}
                  onDuplicateComponent={duplicateComponent}
                />
              </DragDropContext>
            )}

            {view === 'code' && (
              <div className="p-4">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                  {generatedHTML}
                </pre>
              </div>
            )}

            {view === 'preview' && (
              <iframe
                srcDoc={generatedHTML}
                className="w-full h-full border-0"
                title="Preview"
              />
            )}
          </Card>
        </div>

        {/* Right Sidebar - Style Editor & AI Design */}
        <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          {selectedComponent ? (
            <>
              <Tabs defaultValue="styles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="styles">Styles</TabsTrigger>
                  <TabsTrigger value="ai-design">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Design
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="styles" className="mt-4">
                  <StyleEditor
                    component={selectedComponent}
                    onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
                  />
                </TabsContent>
                <TabsContent value="ai-design" className="mt-4">
                  <AIDesignVariations
                    selectedElement={{
                      html: generateHTML([selectedComponent]),
                      type: selectedComponent.type,
                      selector: `#${selectedComponent.id}`
                    }}
                    websiteContext={{}}
                    onVariationApplied={applyDesignVariation}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="p-6 text-center text-gray-500">
              <p>Select a component to edit its styles or get AI design suggestions</p>
            </Card>
          )}
        </div>
      </div>

      <AIContentModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onInsert={insertAIContent}
      />
    </PageContainer>
  );
}