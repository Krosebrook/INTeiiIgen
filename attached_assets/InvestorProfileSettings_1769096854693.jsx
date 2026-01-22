/**
 * Investor Profile Settings Page
 * 
 * Allows users to edit their InvestorProfile with same UI as onboarding.
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import DealCriteriaStep from '../components/onboarding/steps/DealCriteriaStep';
import PortfolioGoalsStep from '../components/onboarding/steps/PortfolioGoalsStep';
import CommunityPreferencesStep from '../components/onboarding/steps/CommunityPreferencesStep';

export default function InvestorProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    deal_criteria: {},
    portfolio_goals: {},
    community_preferences: {},
    ai_personalization: {
      deal_matching_enabled: true,
      email_digest_enabled: true,
      smart_alerts_enabled: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.InvestorProfile.filter({
        user_id: user.id,
        onboarding_completed: true,
      });

      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setFormData({
          deal_criteria: p.deal_criteria || {},
          portfolio_goals: p.portfolio_goals || {},
          community_preferences: p.community_preferences || {},
          ai_personalization: p.ai_personalization || formData.ai_personalization,
        });
      } else {
        toast.error('No profile found. Complete onboarding first.');
      }
    } catch (error) {
      console.error('Profile load error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      await base44.entities.InvestorProfile.update(profile.id, {
        deal_criteria: formData.deal_criteria,
        portfolio_goals: formData.portfolio_goals,
        community_preferences: formData.community_preferences,
        ai_personalization: formData.ai_personalization,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="glass border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400 mb-4">No investor profile found.</p>
            <Button onClick={() => window.location.href = '/DealSourcingOnboarding'}>
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Investor Profile Settings</h1>
            <p className="text-gray-400 mt-1">
              Update your deal criteria, portfolio goals, and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
            {saving ? 'Saving...' : 'Save Changes'}
            <Save className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="deal_criteria" className="space-y-6">
          <TabsList className="glass-strong">
            <TabsTrigger value="deal_criteria">Deal Criteria</TabsTrigger>
            <TabsTrigger value="portfolio_goals">Portfolio Goals</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="deal_criteria">
            <Card className="glass-strong border-white/20">
              <CardContent className="p-8">
                <DealCriteriaStep
                  data={formData}
                  updateData={updateFormData}
                  errors={{}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio_goals">
            <Card className="glass-strong border-white/20">
              <CardContent className="p-8">
                <PortfolioGoalsStep
                  data={formData}
                  updateData={updateFormData}
                  errors={{}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card className="glass-strong border-white/20">
              <CardContent className="p-8">
                <CommunityPreferencesStep
                  data={formData}
                  updateData={updateFormData}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={loadProfile}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Last Saved
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Export Profile Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}