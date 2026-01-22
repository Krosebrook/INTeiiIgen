import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import RedesignForm from "../components/redesign/RedesignForm";
import RedesignComparison from "../components/redesign/RedesignComparison";

export default function WebsiteRedesign() {
  const [user, setUser] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [redesign, setRedesign] = useState(null);

  useEffect(() => {
    loadUser();
    loadWebsites();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not logged in", error);
    }
  };

  const loadWebsites = async () => {
    try {
      const sites = await base44.entities.Website.list("-created_date");
      setWebsites(sites);
    } catch (error) {
      console.error("Error loading websites:", error);
    }
  };

  const handleRedesign = async (data) => {
    setIsRedesigning(true);
    try {
      const prompt = `Redesign this HTML website based on the following specifications:

Original HTML:
${data.originalHtml.substring(0, 10000)}

Redesign Goals:
${data.goals.map(g => `- ${g}`).join('\n')}

Style Preferences:
- Color Scheme: ${data.stylePreferences.color_scheme}
- Design Style: ${data.stylePreferences.design_style}
- Layout Preference: ${data.stylePreferences.layout_preference}

${data.additionalInstructions ? `Additional Instructions:\n${data.additionalInstructions}` : ''}

Create a completely redesigned version that:
1. Maintains the core content and functionality
2. Applies modern design principles and trends
3. Implements the requested color scheme throughout
4. Follows the specified design style aesthetic
5. Uses the preferred layout structure
6. Includes smooth animations and transitions
7. Ensures mobile responsiveness
8. Improves visual hierarchy and readability
9. Enhances user experience
10. Achieves all specified redesign goals

Provide the complete redesigned HTML with embedded CSS.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            redesigned_html: {
              type: "string",
              description: "The complete redesigned HTML"
            },
            changes_made: {
              type: "array",
              items: { type: "string" },
              description: "List of major changes and improvements made"
            }
          }
        }
      });

      const saved = await base44.entities.WebsiteRedesign.create({
        original_website_id: data.websiteId,
        redesign_title: data.redesignTitle,
        original_html: data.originalHtml,
        redesigned_html: result.redesigned_html,
        redesign_goals: data.goals,
        style_preferences: data.stylePreferences,
        changes_made: result.changes_made,
        redesign_prompt: prompt,
        status: "completed"
      });

      setRedesign(saved);
      toast.success("Website redesign completed successfully!");
    } catch (error) {
      console.error("Redesign error:", error);
      toast.error("Failed to redesign website. Please try again.");
    } finally {
      setIsRedesigning(false);
    }
  };

  const handleDownload = () => {
    if (!redesign) return;

    const blob = new Blob([redesign.redesigned_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${redesign.redesign_title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setRedesign(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Website Redesign</h2>
            <p className="text-gray-300 mb-6">Sign in to redesign your websites with AI</p>
            <Button 
              onClick={() => base44.auth.redirectToLogin()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              AI Website Redesign
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Assistant</span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Transform your existing websites with AI-powered design improvements
            </p>
          </motion.div>
        </div>

        {!redesign ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RedesignForm
                websites={websites}
                onRedesign={handleRedesign}
                isRedesigning={isRedesigning}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4">Redesign Features</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>✓ Modern design trends</p>
                    <p>✓ Custom color schemes</p>
                    <p>✓ Improved layouts</p>
                    <p>✓ Better typography</p>
                    <p>✓ Smooth animations</p>
                    <p>✓ Mobile optimization</p>
                    <p>✓ Enhanced UX</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-white hover:bg-white/10"
              >
                ← Create New Redesign
              </Button>
            </div>
            <RedesignComparison
              redesign={redesign}
              onDownload={handleDownload}
            />
          </>
        )}
      </div>
    </div>
  );
}