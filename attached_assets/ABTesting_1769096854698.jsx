import { useState, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '@/components/hooks/useAuth';
import useWebsitesData from '@/components/hooks/useWebsitesData';
import ProductTour from '@/components/onboarding/ProductTour';
import TourTrigger from '@/components/onboarding/TourTrigger';
import { useTour } from '@/components/onboarding/useTour';
import { abTestingTour } from '@/components/onboarding/tours/abTestingTour';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

// Lazy load heavy test manager component
const ABTestManager = lazy(() => import('@/components/testing/ABTestManager'));

/** A/B Testing Lab Page
 * - Allows users to create, configure, and analyze A/B tests
 * - Supports multi-variant testing with AI-powered suggestions
 * - Real-time result analysis and statistical significance tracking
 */
function ABTesting() {
  const { user, isLoading: authLoading } = useAuth();
  const { websites, isLoading: websitesLoading } = useWebsitesData();
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const { isOpen: tourOpen, startTour, completeTour, skipTour, hasCompleted } = useTour('ab-testing', true);

  // Loading state
  if (authLoading || websitesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSkeleton className="w-32 h-32" />
      </div>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="glass border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <FlaskConical className="w-16 h-16 mx-auto mb-4 text-purple-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-gray-400">Please sign in to access A/B testing</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>A/B Testing - WebCraft AI</title>
        <meta name="description" content="AI-powered A/B testing for your websites. Create, analyze, and scale winning variations." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-4 lg:p-8"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-purple-400" aria-hidden="true" />
                A/B Testing Lab
              </h1>
              <p className="text-gray-400">
                AI-powered testing to optimize your website performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TourTrigger onClick={startTour} hasCompleted={hasCompleted} />
              <div className="w-full md:w-64">
                <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select website..." />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {websites?.map((website) => (
                      <SelectItem key={website.id} value={website.id}>
                        {website.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content */}
          {selectedWebsite ? (
            <Suspense fallback={<LoadingSkeleton className="h-96" />}>
              <ABTestManager websiteId={selectedWebsite} />
            </Suspense>
          ) : (
            <Card className="glass border-white/10">
              <CardContent className="py-24 text-center">
                <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a Website
                </h3>
                <p className="text-gray-400">
                  Choose a website to start creating A/B tests
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Product Tour */}
        <ProductTour
          steps={abTestingTour}
          isOpen={tourOpen}
          onComplete={completeTour}
          onSkip={skipTour}
          tourKey="ab-testing"
        />
      </motion.div>
    </>
  );
}

export default ABTesting;