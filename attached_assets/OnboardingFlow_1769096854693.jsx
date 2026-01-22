/**
 * Main onboarding entry point.
 * Routes between wizard, tutorials, and nudges.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import OnboardingWizardV2 from '../components/onboarding/OnboardingWizardV2';
import { Loader } from 'lucide-react';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/auth/login');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <OnboardingWizardV2
      onComplete={() => {
        // Redirect to dashboard after onboarding
        navigate('/dashboard');
      }}
    />
  );
}