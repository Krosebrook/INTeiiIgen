import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Zap, Users, Sparkles } from 'lucide-react';
import useAuth from '@/components/hooks/useAuth';
import useWebsitesData from '@/components/hooks/useWebsitesData';
import ProductTour from '@/components/onboarding/ProductTour';
import TourTrigger from '@/components/onboarding/TourTrigger';
import { useTour } from '@/components/onboarding/useTour';
import { personalizationTour } from '@/components/onboarding/tours/personalizationTour';
import SegmentManager from '@/components/personalization/SegmentManager';
import PersonalizationManager from '@/components/personalization/PersonalizationManager';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import WebsiteSelector from '@/components/shared/WebsiteSelector';
import { LoadingState, EmptyState } from '@/components/shared/DataState';
import { base44 } from '@/api/base44Client';

export default function Personalization() {
  const { user, isLoading: authLoading } = useAuth();
  const { websites, isLoading: websitesLoading } = useWebsitesData();
  const [selectedWebsite, setSelectedWebsite] = useState('');
  
  const { isOpen: tourOpen, startTour, completeTour, skipTour, hasCompleted } = useTour('personalization', true);

  if (authLoading || websitesLoading) {
    return <LoadingState fullScreen message="Loading personalization..." />;
  }

  if (!user) {
    return (
      <EmptyState
        fullScreen
        icon={Target}
        title="Sign In Required"
        message="Please sign in to access AI personalization features"
        action={() => base44.auth.redirectToLogin()}
        actionLabel="Sign In"
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Personalization - WebCraft AI</title>
        <meta name="description" content="Dynamic content personalization with AI" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <PageHeader
              icon={Target}
              title="AI Personalization"
              description="Tailor content for different user segments with AI-powered optimization"
              actions={<WebsiteSelector value={selectedWebsite} onChange={setSelectedWebsite} />}
            />
          </div>
          <TourTrigger onClick={startTour} hasCompleted={hasCompleted} />
        </div>

        {selectedWebsite ? (
          <Tabs defaultValue="engine" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger 
                value="engine" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
                data-tour="ai-engine"
              >
                <Zap className="w-4 h-4 mr-2" />
                AI Engine
              </TabsTrigger>
              <TabsTrigger 
                value="segments" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
                data-tour="segment-manager"
              >
                <Users className="w-4 h-4 mr-2" />
                Segments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="engine" className="mt-6">
              <PersonalizationManager 
                website={websites?.find(w => w.id === selectedWebsite)}
              />
            </TabsContent>

            <TabsContent value="segments" className="mt-6">
              <SegmentManager websiteId={selectedWebsite} />
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Select a Website"
            message="Choose a website to configure AI-powered personalization and segment targeting"
          />
        )}
        
        <ProductTour
          steps={personalizationTour}
          isOpen={tourOpen}
          onComplete={completeTour}
          onSkip={skipTour}
          tourKey="personalization"
        />
      </PageContainer>
    </>
  );
}