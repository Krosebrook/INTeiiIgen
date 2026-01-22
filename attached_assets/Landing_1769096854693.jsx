import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  Code, 
  Palette, 
  BarChart3, 
  Globe,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';
import { generateHeroScreenshot } from '@/utils/imageGenerators';

export default function Landing() {
  const handleGetStarted = () => {
    base44.auth.redirectToLogin(window.location.origin + '/dashboard');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Create production-ready websites with advanced AI in seconds'
    },
    {
      icon: Code,
      title: 'Clean Code Output',
      description: 'Export semantic HTML, optimized CSS, and modern JavaScript'
    },
    {
      icon: Palette,
      title: 'Beautiful Templates',
      description: 'Choose from professionally designed templates across industries'
    },
    {
      icon: BarChart3,
      title: 'Built-in Analytics',
      description: 'Track performance, SEO scores, and user engagement metrics'
    },
    {
      icon: Zap,
      title: 'A/B Testing',
      description: 'Optimize conversions with intelligent variant testing'
    },
    {
      icon: Globe,
      title: 'Multi-page Support',
      description: 'Generate complete websites with navigation and sitemaps'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      content: 'Cut our landing page creation time from days to minutes. The AI understands context perfectly.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Startup Founder',
      content: 'Built our entire company website in under an hour. Quality rivals professional agencies.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Marketing Director',
      content: 'The SEO optimization is incredible. Our pages rank within weeks of publishing.',
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>WebCraft AI - Build Professional Websites with AI in Minutes</title>
        <meta 
          name="description" 
          content="Transform your ideas into production-grade websites instantly. AI-powered website builder with SEO optimization, analytics, and A/B testing. No coding required." 
        />
        <meta property="og:title" content="WebCraft AI - Build Professional Websites with AI" />
        <meta property="og:description" content="Transform your ideas into production-grade websites instantly with AI." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">AI-Powered Website Generation</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold gradient-text mb-6">
                Build Stunning Websites
                <br />
                <span className="text-white">in Minutes, Not Days</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Transform your ideas into production-grade websites with AI. 
                No coding required. SEO-optimized. Analytics built-in.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 hover:bg-white/10 text-lg px-8 py-6"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                >
                  See How It Works
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Free forever plan
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-16 relative"
            >
              <div className="glass-strong rounded-2xl border border-white/20 p-8 shadow-cinema-xl">
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg overflow-hidden">
                  <img 
                    src={generateHeroScreenshot('WebCraft AI Dashboard', 1200, 675)}
                    alt="WebCraft AI platform interface showing website generation dashboard"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Everything You Need to Build Fast
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Powerful features designed for creators, marketers, and businesses
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 lg:py-32 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Loved by Creators Worldwide
              </h2>
              <p className="text-xl text-gray-400">
                Join thousands building better websites with AI
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-strong p-6 rounded-xl border border-white/10"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Build Your Website?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of creators using AI to build better websites faster
              </p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6"
              >
                Start Building Free
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}