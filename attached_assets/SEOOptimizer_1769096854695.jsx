import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import useAuth from '@/components/hooks/useAuth';
import useWebsitesData from '@/components/hooks/useWebsitesData';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import WebsiteSelector from '@/components/shared/WebsiteSelector';
import { LoadingState, EmptyState } from '@/components/shared/DataState';
import SEOOptimizationDashboard from '@/components/seo/SEOOptimizationDashboard';
import { base44 } from '@/api/base44Client';

export default function SEOOptimizer() {
  const { user, isLoading: authLoading } = useAuth();
  const { websites, isLoading: websitesLoading } = useWebsitesData();
  const [selectedWebsite, setSelectedWebsite] = useState('');

  if (authLoading || websitesLoading) {
    return <LoadingState fullScreen message="Loading SEO optimizer..." />;
  }

  if (!user) {
    return (
      <EmptyState
        fullScreen
        icon={Search}
        title="Sign In Required"
        message="Please sign in to access AI-powered SEO optimization"
        action={() => base44.auth.redirectToLogin()}
        actionLabel="Sign In"
      />
    );
  }

  const selectedWebsiteData = websites?.find(w => w.id === selectedWebsite);

  return (
    <>
      <Helmet>
        <title>AI SEO Optimizer - WebCraft AI</title>
        <meta name="description" content="Optimize your website content for search engines with AI" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageContainer>
        <PageHeader
          icon={Search}
          title="AI SEO Optimizer"
          description="Automatically analyze and improve your website's SEO with AI-powered suggestions"
          actions={<WebsiteSelector value={selectedWebsite} onChange={setSelectedWebsite} />}
        />

        {selectedWebsite ? (
          <SEOOptimizationDashboard website={selectedWebsiteData} />
        ) : (
          <EmptyState
            icon={Search}
            title="Select a Website"
            message="Choose a website to analyze and optimize its SEO performance"
          />
        )}
      </PageContainer>
    </>
  );
}