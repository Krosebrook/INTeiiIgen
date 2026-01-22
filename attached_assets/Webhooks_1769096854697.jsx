import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Webhook, Activity, Settings, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '@/components/hooks/useAuth';
import ProductTour from '@/components/onboarding/ProductTour';
import TourTrigger from '@/components/onboarding/TourTrigger';
import { useTour } from '@/components/onboarding/useTour';
import { webhooksTour } from '@/components/onboarding/tours/webhooksTour';

import WebhookEndpoints from '@/components/webhooks/WebhookEndpoints';
import WebhookLogs from '@/components/webhooks/WebhookLogs';
import WebhookDeadLetters from '@/components/webhooks/WebhookDeadLetters';
import IntegrationManager from '@/components/integrations/IntegrationManager';

export default function Webhooks() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('endpoints');
  const { isOpen: tourOpen, startTour, completeTour, skipTour, hasCompleted } = useTour('webhooks', true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            Admin privileges required to manage webhooks and integrations
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Webhooks & Integrations - WebCraft AI</title>
        <meta name="description" content="Manage webhooks, integrations, and automation" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen p-4 lg:p-8"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3">
                <Webhook className="w-8 h-8 text-purple-400" />
                Webhooks & Integrations
              </h1>
              <p className="text-gray-400">
                Automate workflows with webhooks and third-party integrations
              </p>
            </div>
            <TourTrigger onClick={startTour} hasCompleted={hasCompleted} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger value="endpoints" data-tour="webhook-endpoints">
                <Webhook className="w-4 h-4 mr-2" />
                Endpoints
              </TabsTrigger>
              <TabsTrigger value="logs" data-tour="webhook-logs">
                <Activity className="w-4 h-4 mr-2" />
                Activity Logs
              </TabsTrigger>
              <TabsTrigger value="failed" data-tour="dead-letters">
                <AlertCircle className="w-4 h-4 mr-2" />
                Failed Events
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Settings className="w-4 h-4 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="mt-6">
              <WebhookEndpoints />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <WebhookLogs />
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              <WebhookDeadLetters />
            </TabsContent>

            <TabsContent value="integrations" className="mt-6">
              <IntegrationManager />
            </TabsContent>
          </Tabs>
          
          <ProductTour
            steps={webhooksTour}
            isOpen={tourOpen}
            onComplete={completeTour}
            onSkip={skipTour}
          />
        </div>
      </motion.div>
    </>
  );
}