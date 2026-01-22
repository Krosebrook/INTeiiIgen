import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Download, AlertTriangle, CheckCircle2, XCircle, User, Shield, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import FlowchartRenderer from '@/components/flowchart/FlowchartRenderer';
import InsightsPanel from '@/components/flowchart/InsightsPanel';
import TourLauncher from '@/components/onboarding/TourLauncher';
import { FLOW_SIMULATOR_TOUR } from '@/components/onboarding/tours/flowSimulatorTour';
import { motion, AnimatePresence } from 'framer-motion';

const PERSONAS = [
  { value: 'owner', label: 'Owner', icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { value: 'user', label: 'User', icon: User, color: 'text-green-400', bgColor: 'bg-green-500/10' }
];

const FLOWS = [
  { value: 'onboarding', label: 'User Onboarding' },
  { value: 'recognition', label: 'Give Recognition' },
  { value: 'moderation', label: 'Content Moderation' },
  { value: 'gamification', label: 'Gamification Config' }
];

export default function UserFlowSimulator() {
  const [persona, setPersona] = useState('user');
  const [flowName, setFlowName] = useState('onboarding');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    setResult(null);

    try {
      const response = await base44.functions.invoke('simulateUserFlow', {
        persona,
        flow_name: flowName
      });

      if (response.data.success) {
        setResult(response.data);
        toast.success('Flow simulation completed');
      } else {
        toast.error(response.data.error || 'Simulation failed');
      }
    } catch (error) {
      toast.error('Failed to run simulation: ' + error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const exportReport = () => {
    if (!result) return;

    const report = `# User Flow Simulation Report
**Persona:** ${result.persona}
**Flow:** ${result.flow_name}
**Timestamp:** ${new Date(result.timestamp).toLocaleString()}

## Summary
${result.simulation.summary || 'N/A'}

## Critical Issues
${result.simulation.critical_issues?.map(issue => `- ${issue}`).join('\n') || 'None identified'}

## Step-by-Step Walkthrough
${result.simulation.steps?.map(step => `
### Step ${step.step_number}: ${step.page}
**Goal:** ${step.goal}
**Observations:** ${step.observations}
**Action:** ${step.action}
**Friction Points:** ${step.friction_points?.join(', ') || 'None'}
**Sentiment:** ${step.sentiment}
`).join('\n') || 'N/A'}

## Flowchart (Mermaid)
\`\`\`mermaid
${result.simulation.mermaid_flowchart || 'N/A'}
\`\`\`
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-simulation-${result.persona}-${result.flow_name}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const selectedPersona = PERSONAS.find(p => p.value === persona);

  return (
    <PageContainer>
      <PageHeader
        title="AI User Flow Simulator"
        description="Simulate user interactions across roles to identify friction points and optimize journeys"
        icon={Play}
      >
        <TourLauncher tour={FLOW_SIMULATOR_TOUR} />
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1 bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Simulation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div data-tour="persona-selector">
              <label className="text-sm text-gray-300 mb-2 block">Persona</label>
              <div className="grid grid-cols-3 gap-2">
                {PERSONAS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPersona(p.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        persona === p.value
                          ? `${p.bgColor} border-${p.color.split('-')[1]}-500`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto ${persona === p.value ? p.color : 'text-gray-400'}`} />
                      <p className={`text-xs mt-1 ${persona === p.value ? 'text-white' : 'text-gray-400'}`}>
                        {p.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div data-tour="flow-selector">
              <label className="text-sm text-gray-300 mb-2 block">User Flow</label>
              <Select value={flowName} onValueChange={setFlowName}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLOWS.map(flow => (
                    <SelectItem key={flow.value} value={flow.value}>
                      {flow.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              data-tour="run-simulation-btn"
            >
              {isSimulating ? (
                <>Simulating...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>

            {result && (
              <Button
                variant="outline"
                onClick={exportReport}
                className="w-full border-white/20 text-white hover:bg-white/10"
                data-tour="export-report-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!result && !isSimulating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/5 border-white/20 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Play className="w-16 h-16 text-purple-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Simulate</h3>
                    <p className="text-gray-400">Select a persona and flow, then click "Run Simulation"</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isSimulating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/5 border-white/20">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">AI Agent Simulating...</h3>
                    <p className="text-gray-400">Analyzing {flowName} flow as {persona}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && result.simulation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* AI Insights */}
                {result.insights && (
                  <div data-tour="insights-panel">
                    <InsightsPanel insights={result.insights} />
                  </div>
                )}

                {/* Summary Card */}
                <Card className="bg-white/5 border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        {selectedPersona && <selectedPersona.icon className={selectedPersona.color} />}
                        Simulation Results
                      </CardTitle>
                      <Badge variant="outline" className="text-white border-white/20">
                        {result.simulation.steps?.length || 0} Steps
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Summary</h4>
                      <p className="text-white">{result.simulation.summary || 'No summary available'}</p>
                    </div>

                    {result.simulation.critical_issues && result.simulation.critical_issues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          Critical Issues
                        </h4>
                        <ul className="space-y-1">
                          {result.simulation.critical_issues.map((issue, idx) => (
                            <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Step-by-Step Breakdown */}
                {result.simulation.steps && result.simulation.steps.length > 0 && (
                  <Card className="bg-white/5 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Step-by-Step Journey</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.simulation.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-purple-500 pl-4 pb-4 last:pb-0"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-white">
                                Step {step.step_number}: {step.page}
                              </h5>
                              <Badge
                                variant="outline"
                                className={`
                                  ${step.sentiment === 'positive' ? 'border-green-500 text-green-400' : ''}
                                  ${step.sentiment === 'negative' ? 'border-red-500 text-red-400' : ''}
                                  ${step.sentiment === 'neutral' ? 'border-gray-500 text-gray-400' : ''}
                                `}
                              >
                                {step.sentiment === 'positive' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {step.sentiment === 'negative' && <XCircle className="w-3 h-3 mr-1" />}
                                {step.sentiment}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-2"><strong>Goal:</strong> {step.goal}</p>
                            <p className="text-sm text-gray-300 mb-2"><strong>Observations:</strong> {step.observations}</p>
                            <p className="text-sm text-white mb-2"><strong>Action:</strong> {step.action}</p>
                            {step.friction_points && step.friction_points.length > 0 && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                <p className="text-xs font-semibold text-red-400 mb-1">Friction Points:</p>
                                <ul className="text-xs text-red-300 space-y-0.5">
                                  {step.friction_points.map((fp, fpIdx) => (
                                    <li key={fpIdx}>• {fp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Flowchart Visualization */}
                {result.simulation.mermaid_flowchart && (
                  <Card className="bg-white/5 border-white/20" data-tour="flowchart">
                    <CardHeader>
                      <CardTitle className="text-white">Visual Flowchart</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FlowchartRenderer mermaidCode={result.simulation.mermaid_flowchart} />
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}