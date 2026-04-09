import { motion } from 'framer-motion';
import { Users, Layers, Code2, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MotionCard } from '../components/ui/Card';
import SEO from '../components/ui/SEO';

const fadeUp = (delay = 0, duration = 0.65) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const processSteps = [
  {
    step: '01', icon: Users,
    title: 'Discover & Understand',
    desc: 'We immerse ourselves in your business ecosystem — mapping stakeholder goals, user journeys, technical debt, and competitive dynamics to craft a precise technical brief.',
    color: 'text-blue-500', bg: 'bg-blue-50',
    details: ['Stakeholder Interviews', 'Technical Debt Audit', 'Competitor Analysis', 'Requirements Gathering']
  },
  {
    step: '02', icon: Layers,
    title: 'Design & Architect',
    desc: 'High-fidelity UI prototypes, system architecture blueprints, API contracts, and database schemas are finalized before a single line of production code is written.',
    color: 'text-violet-500', bg: 'bg-violet-50',
    details: ['UI/UX Prototyping', 'System Architecture', 'API Contract Design', 'Database Modeling']
  },
  {
    step: '03', icon: Code2,
    title: 'Develop & Iterate',
    desc: 'Agile sprints with bi-weekly working demos. Clean TypeScript, peer-reviewed PRs, CI/CD pipelines from Day 1, and progress you can see and feel at every checkpoint.',
    color: 'text-brand', bg: 'bg-brand/6',
    details: ['Two-Week Sprints', 'Automated CI/CD', 'Strict Code Reviews', 'Working Demos']
  },
  {
    step: '04', icon: Zap,
    title: 'Deliver & Scale',
    desc: 'Rigorous QA, load testing, staged rollouts, and performance auditing before every production release. Post-launch, we monitor, optimize, and remain your technology partner.',
    color: 'text-emerald-500', bg: 'bg-emerald-50',
    details: ['Security Penetration Testing', 'Load & Stress Testing', 'Zero-Downtime Deployment', 'Post-Launch Retention']
  },
];

export default function OurFlowPage() {
  return (
    <div className="w-full">
      <SEO 
        title="Our Methodology | Predictable Delivery" 
        description="Discover the Vichakra four-phase process for delivering extraordinary digital products. We eliminate uncertainty and maximize velocity."
        keywords="software development methodology, agile sprints, system architecture design, scalable deployments"
        url="/our-flow"
      />

      {/* ======= HERO ======= */}
      <section className="relative pt-32 pb-24 bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-900/30 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="relative container mx-auto px-6 lg:px-12 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/25 text-brand font-semibold text-xs tracking-widest uppercase mb-7">
              Our Methodology
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tightest leading-[1.05] mb-7">
              Predictable delivery for <span className="gradient-text">ambitious builds.</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              A proven four-phase process that eliminates uncertainty, maximizes velocity, and consistently produces work that exceeds expectations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ======= THE FLOW ======= */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="hidden lg:block absolute top-[190px] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <motion.div 
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative"
              >
                {/* Visual Step Indicator */}
                <div className="text-center mb-8 relative">
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[100px] font-extrabold text-gray-50 leading-none pointer-events-none select-none z-0">
                    {step.step}
                  </div>
                  <div className="relative z-10 w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-pulse-ring" />
                    <div className="relative w-full h-full rounded-full bg-brand text-white flex items-center justify-center font-bold text-xl shadow-[0_4px_16px_-4px_rgba(15,118,110,0.45)]">
                      {step.step}
                    </div>
                  </div>
                </div>

                <MotionCard hover={false} className="p-8 h-full flex flex-col border border-gray-100 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)]">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-6`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm mb-8 flex-grow">
                    {step.desc}
                  </p>
                  
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    {step.details.map((detail, idx) => (
                       <div key={idx} className="flex items-start gap-2.5">
                         <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                         <span className="text-sm font-semibold text-gray-700">{detail}</span>
                       </div>
                    ))}
                  </div>
                </MotionCard>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ======= CTA SECTION ======= */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 lg:px-12 text-center">
            <motion.div {...fadeUp()} className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 text-balance">
                Ready to experience engineering excellence?
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Take the guesswork out of software delivery. Let’s sit down, discuss your challenges, and map out exactly how phase one looks for your business.
              </p>
              <Button href="/contact" size="xl" className="shadow-brand-md">
                Start the Discovery Phase
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
        </div>
      </section>

    </div>
  );
}
