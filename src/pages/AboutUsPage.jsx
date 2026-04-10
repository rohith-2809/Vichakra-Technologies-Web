import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle,
  Code2,
  Globe,
  Heart,
  Lightbulb,
  Rocket,
  Shield,
  Target, Users, Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MotionCard } from '../components/ui/Card';

const values = [
  { icon: Target, color: 'text-brand', bg: 'bg-brand/10', title: 'Precision Engineering', desc: 'We treat every line of code as a direct reflection of your brand. Accuracy is non-negotiable at Vichakra.' },
  { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', title: 'True Partnership', desc: 'We embed ourselves into your team as a long-term technology partner, not a one-time vendor.' },
  { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', title: 'Relentless Velocity', desc: 'Bi-weekly sprint demos. No vanishing acts. You see tangible progress every 14 days, guaranteed.' },
  { icon: Lightbulb, color: 'text-purple-500', bg: 'bg-purple-50', title: 'Innovation First', desc: 'We proactively explore emerging technologies so you can adopt them before your competition does.' },
  { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Enterprise Security', desc: 'OWASP-compliant by default. Security audits before every major release. Your data, always protected.' },
  { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', title: 'Genuine Care', desc: 'We celebrate your milestones, lose sleep on your challenges, and are genuinely invested in your success.' },
];

const clientTypes = [
  {
    icon: Rocket, title: 'Startups & Scale-Ups',
    desc: 'From zero-to-one MVPs to Series B infrastructure overhauls. We build lean, fast, and ready to scale - with architectures that do not need to be rewritten when you make it.',
    highlights: ['MVP development', 'Investor-ready design', 'Horizontal scale-ready infra'],
  },
  {
    icon: Globe, title: 'Enterprise Organizations',
    desc: 'Modernizing decade-old legacy systems, integrating AI copilots into existing workflows, and building internal tooling that saves hundreds of engineering hours each month.',
    highlights: ['Legacy migration', 'AI/ML integration', 'Internal platforms'],
  },
  {
    icon: Code2, title: 'Product Companies',
    desc: 'Acting as your embedded engineering team, rapidly shipping features, maintaining code quality at scale, and ensuring your product roadmap translates into exceptional user experiences.',
    highlights: ['Feature development', 'Tech debt elimination', 'Product engineering'],
  },
];

const timeline = [
  { year: '2019', event: 'Founded', desc: 'Vichakra Technologies was born from a simple belief: businesses deserve technology partners who truly understand their goals.' },
  { year: '2020', event: 'First 10 Clients', desc: 'Delivered 12 production projects, earning 100% client retention for the first two years.' },
  { year: '2022', event: 'AI Division Launched', desc: 'Established a dedicated AI/ML engineering team, serving clients across APAC and Europe.' },
  { year: '2024', event: '15+ Projects Milestone', desc: 'Crossed the landmark of 15 completed projects with a 4.9/5 client satisfaction score.' },
  { year: 'Now', event: 'Global Reach', desc: 'Serving clients across 12 countries, with engineering expertise spanning 20+ cutting-edge technologies.' },
];

export default function AboutUsPage() {
  return (
    <div className="w-full">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative pt-32 pb-24 bg-hero-gradient bg-hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/6 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-4xl"
          >
            <span className="section-badge mb-6 block w-fit">About Us</span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tightest leading-[1.05] mb-8 text-balance">
              We engineer technology that{' '}
              <span className="gradient-text">creates lasting impact.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-3xl">
              Vichakra Technologies is a premier technology consultancy specializing in crafting world-class digital products. We are engineers, designers, and strategists unified by a singular obsession: building technology that genuinely transforms businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ MISSION STRIP ══════════════════ */}
      <section className="py-6 bg-brand">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-white text-center md:text-left"
          >
            <p className="text-lg font-medium text-white/90 max-w-xl">
              <span className="font-bold text-white">Our Mission:</span> To be the definitive technology partner for businesses ready to compete at the global frontier.
            </p>
            <Button href="/contact" className="bg-white text-brand hover:bg-gray-100 font-bold shrink-0" tooltip="Let's talk strategy">
              Partner With Us <ArrowRight size={16} className="ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ STORY + IMAGE ══════════════════ */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1 space-y-7"
            >
              <span className="section-badge">Our Story</span>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight text-balance">
                Built by builders, for builders.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Vichakra Technologies was founded by a team of senior engineers and product designers who grew frustrated watching businesses underserved by agencies that overpromised and underdelivered. We set out to prove that technical excellence and genuine partnership could coexist.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we are a cross-functional team of developers, UI/UX designers, AI engineers, and product strategists, each bringing deep domain expertise to every engagement. We take on fewer clients intentionally, so we can serve each one extraordinarily.
              </p>
              <div className="space-y-3 pt-2">
                {['ISO-standard engineering practices', 'Proven agile delivery framework', 'Transparent communication & reporting', 'Zero vendor lock-in policy'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-brand shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-15px_rgba(0,0,0,0.12)] aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=85"
                  alt="Vichakra Technologies team"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="glass rounded-2xl p-5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[{ n: '15+', l: 'Projects' }, { n: '12', l: 'Countries' }, { n: '4.9★', l: 'Rating' }].map(({ n, l }) => (
                        <div key={l}>
                          <div className="font-extrabold text-xl text-gray-900">{n}</div>
                          <div className="text-xs text-gray-500">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════ VALUES GRID ══════════════════ */}
      <section className="py-28 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-badge mx-auto w-fit block mb-5">
              Our Values
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              The principles we live and code by.
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <MotionCard key={i} delay={i * 0.08} className="p-8 group cursor-default">
                <div className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <v.icon className={`w-7 h-7 ${v.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TIMELINE ══════════════════ */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-badge mx-auto w-fit block mb-5">Our Journey</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Milestones that define us.
            </motion.h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Connecting dashed line stops exactly at the top and bottom icons */}
            <div className="absolute left-8 top-8 bottom-8 w-px border-l-2 border-dashed border-brand/20" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex gap-8 pl-20"
                >
                  <div className="absolute left-0 w-16 h-16 rounded-2xl bg-white border border-brand/20 flex flex-col items-center justify-center shrink-0 z-10 shadow-[0_4px_20px_-4px_rgba(0,126,121,0.1)]">
                    <span className="text-xs font-black text-brand">{item.year}</span>
                  </div>
                  <div className="pt-3 pb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.event}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ CLIENT TYPES ══════════════════ */}
      <section className="py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute -left-32 top-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/20 text-brand font-semibold text-xs tracking-widest uppercase mb-5">
              Who We Serve
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              Built for ambitious businesses.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientTypes.map((ct, i) => (
              <MotionCard
                key={i} delay={i * 0.1}
                className="p-8 border-white/10 hover:border-brand/40"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <ct.icon className="w-8 h-8 text-brand mb-6" />
                <h3 className="text-xl font-bold text-white mb-4">{ct.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{ct.desc}</p>
                <ul className="space-y-2">
                  {ct.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle size={14} className="text-brand shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Ready to work with us?
            </h2>
            <p className="text-xl text-gray-500 mb-10">
              Let us have a no-pressure discovery call. We will listen more than we talk.
            </p>
            <Button href="/contact" size="xl" tooltip="Schedule a free 30-min strategy call">
              Start the Conversation <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
