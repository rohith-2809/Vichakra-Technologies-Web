import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, MapPin, CheckCircle2, ArrowRight,
  Send, Clock, Globe, MessageSquare, Building2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const WhatsAppIcon = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const services = [
  { value: 'web', label: 'Web Development' },
  { value: 'design', label: 'Website Design' },
  { value: 'ai', label: 'AI-Powered Applications' },
  { value: 'mobile', label: 'Mobile Applications' },
  { value: 'automation', label: 'Business Automation' },
  { value: 'consulting', label: 'Technology Consulting' },
  { value: 'other', label: 'Something Else' },
];

const budgets = [
  { value: 'sub5k', label: 'Under $5,000' },
  { value: '5k_15k', label: '$5,000 - $15,000' },
  { value: '15k_50k', label: '$15,000 - $50,000' },
  { value: '50k_plus', label: '$50,000+' },
  { value: 'unsure', label: 'Not sure yet' },
];

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@vichakratech.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@vichakratech.com',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 99593 62328',
    sub: 'Mon-Fri, 9am to 6pm IST',
    href: 'tel:+919959362328',
  },
  {
    icon: WhatsAppIcon,
    label: 'WhatsApp',
    value: '+91 99593 62328',
    sub: 'Chat with our team instantly',
    href: 'https://wa.me/919959362328',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Hyderabad, India',
    sub: 'Available globally, remote-first',
    href: null,
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Under 24 hours',
    sub: 'Guaranteed on all inquiries',
    href: null,
  },
];

const fieldBase =
  'w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-gray-900 text-base placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent hover:border-gray-300';

const fieldError = 'border-red-300 focus:ring-red-400';

import SEO from '../components/ui/SEO';

export default function ContactUsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      await fetch('https://formsubmit.co/ajax/vichakratechnologies@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company || 'Not Provided',
          phone: data.phone || 'Not Provided',
          service: data.service,
          message: data.message,
          _subject: `New project inquiry from ${data.name}!`,
          _cc: 'rohithvitteamraj@gmail.com',
          _captcha: 'false'
        })
      });
      setSuccess(true);
      reset();
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an issue sending your message. Please try emailing us directly.');
    }
  };

  return (
    <div className="w-full">
      <SEO 
        title="Contact Us | Start Your Project" 
        description="Get in touch with Vichakra Technologies. Let's discuss your web, design, or AI project and build something great together. Available globally."
        keywords="contact Vichakra Technologies, hire developers, technology consulting, start tech project, business automation consulting"
        url="/contact"
      />

      {/* ======= HERO ======= */}
      <section className="relative pt-32 pb-16 bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-900/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '36px 36px' }}
          />
        </div>

        <div className="relative container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/25 text-brand font-semibold text-xs tracking-widest uppercase mb-7">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Open For New Projects
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tightest leading-[1.05] mb-7">
              Let's build{' '}
              <span className="gradient-text">something great</span>{' '}
              together.
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Tell us about your project and we will get back to you within one business day with a tailored plan to move forward.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ======= CONTACT INFO STRIP ======= */}
      <section className="py-8 bg-brand">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactItems.map(({ icon: Icon, label, value, sub, href }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{label}</div>
                  {href ? (
                    <a href={href} className="text-sm font-semibold text-white hover:text-white/80 transition-colors leading-tight block">
                      {value}
                    </a>
                  ) : (
                    <div className="text-sm font-semibold text-white leading-tight">{value}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= MAIN FORM SECTION ======= */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-16 items-start">

            {/* Left column — context */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2 space-y-10"
            >
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How can we help?</h2>
                <p className="text-gray-500 leading-relaxed">
                  Whether you need a full product build from scratch, a design overhaul, or strategic technology consulting, the right conversation starts here.
                </p>
              </div>

              {/* What to expect */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">What happens next?</h3>
                <ol className="space-y-5">
                  {[
                    { n: '01', title: 'We review your submission', desc: 'Every inquiry is personally reviewed by our team within 24 hours.' },
                    { n: '02', title: 'Discovery call scheduled', desc: 'We schedule a 30-minute call to deeply understand your project requirements.' },
                    { n: '03', title: 'Custom proposal delivered', desc: 'You receive a detailed, transparent proposal with timeline and investment breakdown.' },
                  ].map((step) => (
                    <li key={step.n} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {step.n}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{step.title}</div>
                        <div className="text-gray-500 text-sm mt-0.5">{step.desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Trust badges */}
              <div className="space-y-3">
                {[
                  'No commitment required from initial call',
                  'NDA available upon request',
                  'Response guaranteed within 24 business hours',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-brand shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right column — form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center justify-center text-center py-20 px-10"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
                        className="w-24 h-24 rounded-full bg-brand/10 flex items-center justify-center mb-8"
                      >
                        <CheckCircle2 className="w-12 h-12 text-brand" />
                      </motion.div>
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Message received!
                      </h3>
                      <p className="text-gray-500 text-lg mb-10 max-w-md leading-relaxed">
                        Thank you for reaching out. A member of our team will contact you within one business day.
                      </p>
                      <Button onClick={() => setSuccess(false)} variant="secondary" size="lg">
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="p-8 md:p-10 space-y-6"
                    >
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Start your project</h3>
                        <p className="text-gray-400 text-sm">All fields marked with * are required.</p>
                      </div>

                      {/* Name + Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                          <input
                            {...register('name', { required: 'Your name is required' })}
                            placeholder="enter your full name"
                            className={`${fieldBase} ${errors.name ? fieldError : ''}`}
                          />
                          {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Company</label>
                          <input
                            {...register('company')}
                            placeholder="Acme Corp"
                            className={fieldBase}
                          />
                        </div>
                      </div>

                      {/* Email + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                          <input
                            type="email"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                            })}
                            placeholder="company@mail.com"
                            className={`${fieldBase} ${errors.email ? fieldError : ''}`}
                          />
                          {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Phone (Optional)</label>
                          <input
                            type="tel"
                            {...register('phone')}
                            placeholder="+1 555 000 0000"
                            className={fieldBase}
                          />
                        </div>
                      </div>

                      {/* Service */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Service Needed *</label>
                        <select
                          {...register('service', { required: 'Please select a service' })}
                          className={`${fieldBase} cursor-pointer ${errors.service ? fieldError : ''}`}
                        >
                          <option value="">Select a service...</option>
                          {services.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {errors.service && (
                          <p className="text-xs text-red-500 mt-1">{errors.service.message}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Project Details *</label>
                        <textarea
                          {...register('message', { required: 'Tell us about your project' })}
                          rows={5}
                          placeholder="Describe your project goals, current challenges, key requirements, and any relevant timelines..."
                          className={`${fieldBase} resize-none ${errors.message ? fieldError : ''}`}
                        />
                        {errors.message && (
                          <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          size="lg"
                          loading={isSubmitting}
                          className="w-full py-4 text-base font-bold shadow-brand-md"
                          tooltip="We will respond within 24 hours"
                        >
                          {isSubmitting ? 'Sending your message...' : 'Send Message'}
                          {!isSubmitting && <Send className="w-5 h-5 ml-1" />}
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                          By submitting, you agree to our Privacy Policy. We never share your information.
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======= FAQ STRIP ======= */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Common questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 max-w-4xl mx-auto">
            {[
              { q: 'How quickly can you start?', a: 'Most projects kick off within 1-2 weeks of signing an agreement, depending on our current project queue.' },
              { q: 'Do you work with international clients?', a: 'Absolutely. We serve clients across 12+ countries and have established remote-first workflows for seamless collaboration.' },
              { q: 'What if I need changes mid-project?', a: 'We use an agile model with bi-weekly sprints, so scope adjustments are reviewed and incorporated naturally.' },
              { q: 'Do you offer post-launch support?', a: 'Yes. We offer flexible retainer packages for ongoing maintenance, feature development, and performance monitoring.' },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-500 leading-relaxed text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
