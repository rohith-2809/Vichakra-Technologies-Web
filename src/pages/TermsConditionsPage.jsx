import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Code, ShieldCheck, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/ui/SEO';

export default function TermsConditionsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Code,
      title: 'Services & Engagement',
      content: 'Vichakra Technologies provides technology consulting, web development, AI integration, and digital design services. Our engagement terms are defined in individual project agreements (MSAs or SOWs). We reserve the right to decline projects that do not align with our expertise or ethical standards.'
    },
    {
      icon: ShieldCheck,
      title: 'Intellectual Property',
      content: 'Unless otherwise agreed upon in writing, all source code, designs, and digital assets created for a client become the exclusive property of said client upon full payment of the project fees. Vichakra Technologies retains the right to display the work for promotional purposes unless restricted by a specific NDA.'
    },
    {
      icon: Scale,
      title: 'Confidentiality',
      content: 'We adhere to strict confidentiality standards. We will not disclose any sensitive business information or proprietary data shared with us during the course of a project or discovery phase. NDA agreements are available upon request for all clients.'
    },
    {
      icon: HelpCircle,
      title: 'Limitation of Liability',
      content: 'While we strive for excellence in every project, Vichakra Technologies is not liable for indirect, incidental, or consequential damages resulting from the use of our services or software post-delivery, beyond the warranties specified in individual service agreements.'
    }
  ];

  return (
    <div className="w-full bg-white min-h-screen">
      <SEO 
        title="Terms & Conditions | Vichakra Technologies" 
        description="Review the terms and conditions for engaging with Vichakra Technologies for technology and AI services."
        url="/terms"
      />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-10 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm uppercase tracking-widest">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-gray-500 mb-12 text-lg">
              Last updated: April 10, 2026. These terms govern your use of the website and engagement with Vichakra Technologies.
            </p>

            <div className="space-y-12">
              {sections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <section.icon className="text-brand w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Governing Law</h2>
              <p className="text-gray-600 mb-0">
                These terms are governed by the laws of India and international standards for digital services. Any disputes shall be handled through professional mediation or local jurisdiction in Hyderabad.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
