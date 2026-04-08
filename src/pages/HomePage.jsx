import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Code2, Cpu, Smartphone, Globe, Layers, Shield, Zap,
  TrendingUp, CheckCircle, Users, Award, Clock, Star, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MotionCard } from '../components/ui/Card';

/* ─── shared easing ─── */
const ease = [0.25, 0.46, 0.45, 0.94];

const fadeUp = (delay = 0, duration = 0.65) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration, delay, ease },
});

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: d, ease },
  }),
};

/* ─── data ─── */
const features = [
  {
    icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100',
    title: 'Clean Architecture',
    desc: 'Modular, maintainable codebases engineered to evolve cleanly as your product scales over years, not months.',
  },
  {
    icon: Cpu, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100',
    title: 'AI-Driven Automation',
    desc: 'Intelligent pipelines that eliminate manual bottlenecks, compound operational efficiency, and compound business value.',
  },
  {
    icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100',
    title: 'Mobile-First Design',
    desc: 'Pixel-perfect, buttery-smooth experiences across every device — from a flagship phone to a legacy tablet.',
  },
  {
    icon: Globe, color: 'text-brand', bg: 'bg-brand/6', border: 'border-brand/15',
    title: 'Global-Scale Infrastructure',
    desc: 'Cloud-native deployments built for reliability, geographic distribution, and enterprise-grade uptime.',
  },
  {
    icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100',
    title: 'Enterprise Security',
    desc: 'OWASP-compliant architecture, penetration tested before every major release, with zero-trust design principles.',
  },
  {
    icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100',
    title: 'Growth Engineering',
    desc: 'Every system we build is mapped to a revenue outcome. We engineer for traction, not just functionality.',
  },
];

const processSteps = [
  {
    step: '01', icon: Users,
    title: 'Discover & Understand',
    desc: 'We immerse ourselves in your business ecosystem — mapping stakeholder goals, user journeys, technical debt, and competitive dynamics to craft a precise technical brief.',
    color: 'text-blue-500', bg: 'bg-blue-50',
  },
  {
    step: '02', icon: Layers,
    title: 'Design & Architect',
    desc: 'High-fidelity UI prototypes, system architecture blueprints, API contracts, and database schemas are finalized before a single line of production code is written.',
    color: 'text-violet-500', bg: 'bg-violet-50',
  },
  {
    step: '03', icon: Code2,
    title: 'Develop & Iterate',
    desc: 'Agile sprints with bi-weekly working demos. Clean TypeScript, peer-reviewed PRs, CI/CD pipelines from Day 1, and progress you can see and feel at every checkpoint.',
    color: 'text-brand', bg: 'bg-brand/6',
  },
  {
    step: '04', icon: Zap,
    title: 'Deliver & Scale',
    desc: 'Rigorous QA, load testing, staged rollouts, and performance auditing before every production release. Post-launch, we monitor, optimize, and remain your technology partner.',
    color: 'text-emerald-500', bg: 'bg-emerald-50',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen', role: 'CTO, NexaFlow Inc.', rating: 5,
    quote: 'Vichakra rebuilt our entire SaaS platform in 90 days with zero downtime migration. The architectural decisions they made are still scaling perfectly two years later.',
  },
  {
    name: 'Arjun Mehta', role: 'Founder, ScaleOps', rating: 5,
    quote: 'Their AI automation suite reduced our operations overhead by 60% within the first quarter. The ROI was visible before we even finished the first sprint.',
  },
  {
    name: 'Elena Rossi', role: 'Product Lead, UrbanMobility', rating: 5,
    quote: 'The most technically gifted and commercially aware team we have worked with. They push back intelligently, propose better solutions, and deliver extraordinary quality.',
  },
];

const clientAvatars = [
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=48&h=48&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=48&h=48&fit=crop&crop=face&q=80',
];

const stats = [
  { n: '15+', label: 'Projects Delivered' },
  { n: '100%', label: 'Client Satisfaction' },
  { n: '1+', label: 'Years Experience' },
  { n: '20+', label: 'Technologies' },
  { n: '98.5%', label: 'On-Time Delivery' },
  { n: '60%', label: 'Avg. Ops Cost Reduction' },
];

import SEO from '../components/ui/SEO';

/* ─── component ─── */
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div className="flex flex-col w-full">
      <SEO
        title="Enterprise Technology & Software Development"
        description="Vichakra Technologies builds high-performance web platforms and AI-driven automation systems to propel ambitious businesses. We engineer outcomes and competitive advantage."
        keywords="enterprise technology, scalable software development, custom software, AI automation, high-performance web platforms, tech strategy"
        url="/"
      />

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} className="relative min-h-[95vh] flex items-center bg-hero-gradient bg-dot-grid overflow-hidden">
        {/* Ambient glow orbs — parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[8%] w-[520px] h-[520px] bg-brand/7 rounded-full blur-[90px]" />
          <div className="absolute bottom-[15%] left-[2%] w-[380px] h-[380px] bg-teal-300/8 rounded-full blur-[80px]" />
          <div className="absolute top-[40%] left-[30%] w-[260px] h-[260px] bg-brand/4 rounded-full blur-[60px]" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 container mx-auto px-6 lg:px-12 pt-20 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* ── Left: Copy ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-8"
            >
              <motion.div custom={0} variants={itemFade}>
                <span className="section-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Trusted by 15+ Global Businesses
                </span>
              </motion.div>

              <motion.h1
                custom={0.08}
                variants={itemFade}
                className="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.05] text-balance"
              >
                Enterprise Technology,{' '}
                <span className="gradient-text">Engineered for Scale.</span>
              </motion.h1>

              <motion.p custom={0.16} variants={itemFade} className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl">
                From high-performance web platforms to AI-driven automation systems, Vichakra Technologies builds the precise digital infrastructure that propels ambitious businesses from where they are to where they need to be.
              </motion.p>

              <motion.div custom={0.24} variants={itemFade} className="flex flex-wrap gap-4 pt-1">
                <Button href="/contact" size="lg" tooltip="Zero commitment — just a conversation">
                  Start a Project
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                <Button href="/why-us" variant="secondary" size="lg" tooltip="See our full capability set">
                  Explore Capabilities
                </Button>
              </motion.div>

              {/* Social proof row */}
              <motion.div custom={0.32} variants={itemFade} className="flex items-center gap-5 pt-2">
                <div className="flex -space-x-3">
                  {clientAvatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Client"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-bold text-gray-900 text-sm ml-1.5">4.9 / 5</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Average rating across 15+ client engagements</p>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Right: Visual card ── */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)] aspect-[3/3.5]">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=720&q=85"
                    alt="Developer working on premium enterprise software"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-gray-900/5 to-transparent" />
                </div>

                {/* Floating metric — growth */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -left-10 top-[22%] glass rounded-2xl px-5 py-4 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-brand/12 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xl text-gray-900 leading-none">+240%</div>
                      <div className="text-xs text-gray-500 mt-0.5">Avg. Client Growth</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating metric — delivery */}
                <motion.div
                  animate={{ y: [0, 9, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute -right-8 bottom-[20%] glass rounded-2xl px-5 py-4 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xl text-gray-900 leading-none">98.5%</div>
                      <div className="text-xs text-gray-500 mt-0.5">On-Time Delivery</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════ STATS TICKER ══════════════ */}
      <section className="py-5 border-y border-gray-100/80 bg-white overflow-hidden">
        <div className="relative flex">
          <motion.div
            className="flex items-center gap-12 whitespace-nowrap animate-ticker"
          >
            {[...stats, ...stats].map((item, i) => (
              <div key={i} className="flex items-center gap-5 shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-brand">{item.n}</span>
                  <span className="text-sm font-semibold text-gray-500">{item.label}</span>
                </div>
                <div className="w-px h-4 bg-gray-200 shrink-0" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ ABOUT BRIEF ══════════════ */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.75, ease }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=85"
                  alt="Vichakra Technologies team collaborating"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-brand/15 to-transparent" />
              </div>
              {/* Stats overlay card */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl p-5 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.10)] border border-gray-100">
                <div className="grid grid-cols-2 gap-5 text-center">
                  {[{ n: '15+', l: 'Projects' }, { n: '5+', l: 'Years' }].map(({ n, l }) => (
                    <div key={l}>
                      <div className="text-2xl font-extrabold gradient-text leading-none">{n}</div>
                      <div className="text-xs text-gray-500 mt-1 font-medium">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.75, delay: 0.1, ease }}
              className="space-y-6"
            >
              <span className="section-badge">About Vichakra</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] text-balance">
                We build technology that creates sustainable competitive advantage.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Founded on the conviction that great software is a strategic asset, Vichakra Technologies partners with ambitious companies to design, build, and scale the digital infrastructure that powers their growth. We are engineers, designers, and product thinkers who take fewer clients intentionally — so we can serve each one extraordinarily.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Full-stack development',
                  'AI and ML integration',
                  'Agile sprint delivery',
                  'Long-term partnership',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                    <CheckCircle size={15} className="text-brand shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Button href="/about" variant="secondary" size="md" tooltip="Read our full story">
                  Our Full Story
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ WHY US (FEATURES) ══════════════ */}
      <section className="section-padding bg-gray-50/70 border-t border-gray-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-14">
            <motion.span {...fadeUp()} className="section-badge block w-fit mb-5">Why Choose Us</motion.span>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight text-balance mb-5">
              The capabilities that define us.
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500 leading-relaxed">
              We do not just write code. We engineer outcomes. Here is what makes partnering with Vichakra different from every other agency you have evaluated.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {features.map((f, i) => (
              <MotionCard key={i} delay={i * 0.07} className="p-8 group cursor-default">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-350`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ OUR FLOW ══════════════ */}
      <section id="our-flow" className="section-padding bg-white overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span {...fadeUp()} className="section-badge mx-auto w-fit block mb-5">Our Methodology</motion.span>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5">
              How we deliver extraordinary results.
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500 leading-relaxed">
              A proven four-phase process that eliminates uncertainty, maximizes velocity, and consistently produces work that exceeds expectations.
            </motion.p>
          </div>

          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-[54px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {processSteps.map((step, i) => (
                <MotionCard
                  key={i}
                  delay={i * 0.13}
                  hover={false}
                  className="p-8 text-center relative overflow-hidden group cursor-default"
                >
                  {/* Watermark number */}
                  <div className="absolute -top-3 -right-1 text-[88px] font-extrabold text-gray-100 leading-none pointer-events-none select-none group-hover:text-brand/6 transition-colors duration-500">
                    {step.step}
                  </div>

                  {/* Step bubble */}
                  <div className="relative mx-auto w-14 h-14 mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-pulse-ring" />
                    <div className="relative w-full h-full rounded-full bg-brand text-white flex items-center justify-center font-bold text-base shadow-[0_4px_16px_-4px_rgba(15,118,110,0.45)]">
                      {step.step}
                    </div>
                  </div>

                  <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center mx-auto mb-5`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </MotionCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="section-padding bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-900/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-dot-grid opacity-[0.04]" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <motion.span {...fadeUp()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/20 text-brand font-semibold text-xs tracking-widest uppercase border border-brand/25 mb-6 w-fit mx-auto block">
              Client Voices
            </motion.span>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              Trusted by builders worldwide.
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {testimonials.map((t, i) => (
              <MotionCard
                key={i}
                delay={i * 0.1}
                className="p-8 border-white/8 hover:border-brand/35"
                style={{ background: 'rgba(255,255,255,0.045)', backdropFilter: 'blur(8px)' }}
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-gray-300 leading-relaxed mb-7 text-[15px] italic">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/25 flex items-center justify-center font-bold text-brand text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 bg-teal-gradient animate-gradient" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.08]" />

        <div className="relative container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/85 text-xs font-semibold tracking-widest uppercase mb-8 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              Accepting New Projects — Q2 2026
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] text-balance mb-7">
              Ready to build something extraordinary?
            </h2>

            <p className="text-xl text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join 15+ businesses that chose Vichakra to power their most critical digital infrastructure. Start with a zero-pressure discovery call.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/contact"
                variant="white"
                size="xl"
                className="border-white/35 hover:bg-white hover:text-brand font-bold"
                tooltip="Free 30-minute strategy session"
              >
                Schedule a Discovery Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button
                href="/why-us"
                size="xl"
                className="bg-white text-brand hover:bg-gray-50 font-bold shadow-xl"
                tooltip="See our services and case studies"
              >
                View Capabilities
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
