import { motion } from 'framer-motion';
import {
  Globe, Code2, Cpu, Smartphone, ArrowRight, CheckCircle,
  Zap, Shield, TrendingUp, Users, Award, Star,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MotionCard } from '../components/ui/Card';

/* ---- data ---- */
const services = [
  {
    id: 'web',
    icon: Globe,
    color: 'text-blue-500',
    border: 'border-t-blue-500',
    bg: 'bg-blue-50',
    title: 'Web Development',
    tagline: 'Scalable, fast, and beautiful',
    desc: 'From high-traffic marketing sites to complex enterprise web applications, we build with performance, accessibility, and long-term maintainability at the core.',
    stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    id: 'design',
    icon: Star,
    color: 'text-purple-500',
    border: 'border-t-purple-500',
    bg: 'bg-purple-50',
    title: 'Website Design',
    tagline: 'Conversion-driven premium UI/UX',
    desc: 'World-class UI/UX design grounded in user psychology, business strategy, and visual excellence. Every pixel is intentional and every interaction is purposeful.',
    stack: ['Figma', 'Prototyping', 'Design Systems', 'Motion Design', 'Accessibility'],
  },
  {
    id: 'ai',
    icon: Cpu,
    color: 'text-brand',
    border: 'border-t-brand',
    bg: 'bg-brand/5',
    title: 'AI-Powered Applications',
    tagline: 'Intelligent automation at scale',
    desc: 'We integrate large language models, computer vision, and predictive analytics directly into your product workflows, eliminating bottlenecks and creating compounding efficiency gains.',
    stack: ['OpenAI', 'LangChain', 'Python', 'TensorFlow', 'FastAPI'],
  },
  {
    id: 'mobile',
    icon: Smartphone,
    color: 'text-orange-500',
    border: 'border-t-orange-500',
    bg: 'bg-orange-50',
    title: 'Mobile Applications',
    tagline: 'Native-grade cross-platform apps',
    desc: 'React Native and Flutter apps that feel premium on every device. We deliver mobile experiences with smooth animations, offline capabilities, and deep platform integration.',
    stack: ['React Native', 'Flutter', 'Expo', 'Firebase', 'App Store Deployment'],
  },
];

const strengths = [
  { icon: Award, title: 'Quality Without Compromise', desc: 'We apply senior-level judgment to every decision. No cutting corners, no template code, no afterthought QA.' },
  { icon: Zap, title: 'Speed Without Chaos', desc: 'Bi-weekly sprint cycles with full transparency. You see real, working software every two weeks, guaranteed.' },
  { icon: TrendingUp, title: 'ROI-Focused Engineering', desc: 'Every feature we build is mapped to a business outcome. We ask "why" before we ever write a line.' },
  { icon: Shield, title: 'Security by Default', desc: 'OWASP-compliant architecture, penetration testing before launch, and continuous vulnerability monitoring post-release.' },
  { icon: Users, title: 'Embedded Partnership', desc: 'We join Slack, attend standups, and share ownership of outcomes. We succeed only when you succeed.' },
  { icon: Globe, title: 'Global Delivery Standards', desc: 'Timezone-aligned communication, ISO-grade documentation, and a process that works across cultures and industries.' },
];

const comparisons = [
  { label: 'Senior engineers on every project', us: true },
  { label: 'Bi-weekly working demos', us: true },
  { label: 'Fixed-price or time-and-material contracts', us: true },
  { label: 'Post-launch retainer support', us: true },
  { label: 'Full-stack AI integration capability', us: true },
  { label: 'Zero vendor lock-in architecture', us: true },
  { label: 'Direct founder access', us: true },
];

/* ---- animation ---- */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

import SEO from '../components/ui/SEO';

export default function WhyUsPage() {
  return (
    <div className="w-full">
      <SEO 
        title="Why Choose Us | Premium Web & AI Services" 
        description="Discover the Vichakra difference. From web development to AI applications, we ensure scalable, secure, and ROI-focused engineering solutions."
        keywords="why Vichakra, web development services, AI powered applications, ROI focused engineering, enterprise security development"
        url="/why-us"
      />

      {/* ======= HERO ======= */}
      <section className="relative pt-32 pb-28 bg-hero-gradient bg-hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div {...fadeUp()} className="max-w-4xl">
            <span className="section-badge mb-7 block w-fit">Why Vichakra</span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tightest leading-[1.05] mb-7 text-balance">
              The technology partner that{' '}
              <span className="gradient-text">thinks further ahead.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mb-10">
              Most agencies deliver code. We deliver competitive advantage. Here is a deep look at the capabilities, principles, and ecosystem that make Vichakra Technologies the partner of choice for businesses that demand the extraordinary.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/contact" size="lg" tooltip="Start a conversation today" className="shadow-brand-md">
                Partner With Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button href="/about" variant="secondary" size="lg">
                Learn About Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======= ECOSYSTEM MAP ======= */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span {...fadeUp()} className="section-badge mx-auto w-fit block mb-5">
              Our Ecosystem
            </motion.span>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
              One partner. Every capability.
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500">
              Vichakra sits at the center of your digital ecosystem, orchestrating a full suite of capabilities that work in harmony to accelerate your growth.
            </motion.p>
          </div>

          {/* Capability Map */}
          <div className="relative max-w-5xl mx-auto">
            {/* Center node */}
            <div className="flex justify-center mb-16">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: 'backOut' }}
                className="relative"
              >
                <div className="w-40 h-40 rounded-full bg-white border-4 border-brand/25 shadow-brand-lg flex flex-col items-center justify-center relative z-10 cursor-default">
                  <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center font-extrabold text-3xl mb-2 shadow-brand-md">
                    V
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center leading-tight px-3">Vichakra<br />Technologies</span>
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-[ping_3.5s_ease-in-out_infinite]" />
                <div className="absolute inset-[-16px] rounded-full border border-brand/10 animate-[ping_5s_ease-in-out_infinite]" />
              </motion.div>
            </div>

            {/* Service cards in 2x2 grid with connector lines via CSS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((svc, i) => (
                <MotionCard
                  key={svc.id}
                  delay={i * 0.1}
                  className={`p-7 border-t-4 ${svc.border} group cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-xl ${svc.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <svc.icon className={`w-6 h-6 ${svc.color}`} />
                  </div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${svc.color} mb-2`}>{svc.tagline}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{svc.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{svc.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {svc.stack.map((tech) => (
                      <span key={tech} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {tech}
                      </span>
                    ))}
                  </div>
                </MotionCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= STRENGTHS GRID ======= */}
      <section className="py-28 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-16">
            <motion.span {...fadeUp()} className="section-badge block w-fit mb-5">Our Strengths</motion.span>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
              What we stand for, every single project.
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500">
              These are not marketing claims. They are contractual commitments built into how we operate.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strengths.map((s, i) => (
              <MotionCard key={i} delay={i * 0.08} className="p-8 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand/15 transition-all duration-300">
                  <s.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ======= VS COMPARISON ======= */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.span {...fadeUp()} className="section-badge mx-auto w-fit block mb-5">The Vichakra Difference</motion.span>
              <motion.h2 {...fadeUp(0.1)} className="text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Not all agencies are created equal.
              </motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500">
                Here is what you get when you choose a partner that genuinely holds itself to a higher standard.
              </motion.p>
            </div>

            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-premium">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gray-950 text-white">
                <div className="py-5 px-6 text-sm font-semibold text-gray-400 col-span-1">Feature</div>
                <div className="py-5 px-6 text-center text-sm font-bold text-white col-span-1 border-x border-white/10">
                  <span className="gradient-text text-base">Vichakra</span>
                </div>
                <div className="py-5 px-6 text-center text-sm font-semibold text-gray-400 col-span-1">Typical Agency</div>
              </div>

              {comparisons.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={`grid grid-cols-3 border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <div className="py-4 px-6 text-sm text-gray-700 font-medium col-span-1 flex items-center">{row.label}</div>
                  <div className="py-4 px-6 flex items-center justify-center col-span-1 border-x border-gray-100">
                    <CheckCircle className="w-5 h-5 text-brand" />
                  </div>
                  <div className="py-4 px-6 flex items-center justify-center col-span-1">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-gray-300 rotate-45 rounded-full" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= PROCESS TEASER ======= */}
      <section className="py-20 bg-brand text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative container mx-auto px-6 lg:px-12 text-center">
          <motion.div {...fadeUp()} className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Ready to see the difference for yourself?
            </h2>
            <p className="text-xl text-white/75 mb-10">
              Schedule a zero-pressure discovery call and let us show you exactly how we would approach your project.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/contact"
                className="bg-white text-brand hover:bg-gray-50 font-bold shadow-xl"
                size="xl"
                tooltip="Free 30-minute strategy session"
              >
                Book a Discovery Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button href="/about" variant="white" size="xl">
                Read Our Story
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
