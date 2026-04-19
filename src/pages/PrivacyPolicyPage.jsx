import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/ui/SEO';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: 'We collect information that you provide directly to us through our contact forms, including your name, email address, company name, phone number, and any project details you share. This information is necessary for us to understand your requirements and respond to your inquiries.'
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: 'Your information is used strictly to provide you with technology services, respond to project requests, and maintain professional communication. We do not sell, trade, or otherwise transfer your personal information to outside parties except to provide requested services or as required by law.'
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: 'Vichakra Technologies implements industry-standard security measures to maintain the safety of your personal information. We use advanced encryption and secure servers to protect data submitted via our website.'
    },
    {
      icon: FileText,
      title: 'Cookies & Tracking',
      content: 'We use minimal cookies for essential website functionality and to analyze site traffic patterns (e.g., via Google Analytics) to improve user experience. You can choose to disable cookies through your browser settings without affecting your ability to use our primary services.'
    }
  ];

  return (
    <div className="w-full bg-white min-h-screen">
      <SEO 
        title="Privacy Policy | Vichakra Technologies" 
        description="Learn how Vichakra Technologies collects, uses, and protects your personal information."
        url="/privacy"
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
              Privacy Policy
            </h1>
            <p className="text-gray-500 mb-12 text-lg">
              Last updated: April 10, 2026. Your privacy is critically important to us. This policy explains how we handle your information at Vichakra Technologies.
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
              <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
              <p className="text-gray-600 mb-0">
                If you have any questions regarding this Privacy Policy, you may contact us using the information below:
              </p>
              <div className="mt-4 font-semibold text-brand break-all">
                info@vichakratechnologies.com
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
