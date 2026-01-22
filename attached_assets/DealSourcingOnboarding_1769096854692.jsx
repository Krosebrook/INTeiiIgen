/**
 * Deal Sourcing Onboarding Page
 * Entry point for investor onboarding wizard
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import DealSourcingOnboardingWizard from '../components/onboarding/DealSourcingOnboardingWizard';
import { createPageUrl } from '../utils';

export default function DealSourcingOnboarding() {
  const navigate = useNavigate();

  const handleComplete = (profileData) => {
    console.log('Onboarding completed:', profileData);
    
    // Redirect to dashboard with success message
    navigate(createPageUrl('Dashboard'));
  };

  return <DealSourcingOnboardingWizard onComplete={handleComplete} />;
}