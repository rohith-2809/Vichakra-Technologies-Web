import { Link } from 'react-router-dom';
import { Mail, MapPin, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  'Web Development',
  'Website Design',
  'Mobile Applications',
  'AI-Powered Applications',
  'E-Commerce Solutions',
  'Business Automation',
];

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Why Choose Us', path: '/why-us' },
  { name: 'Contact Us', path: '/contact' },
];

/* Inline SVG social icons — brand icons not available in this lucide version */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const socialLinks = [
  { Icon: LinkedInIcon, href: '#', label: 'LinkedIn' },
  { Icon: TwitterIcon, href: '#', label: 'X / Twitter' },
  { Icon: GitHubIcon, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      {/* Background glows */}
      <div className="absolute -left-40 top-0 w-[500px] h-[500px] bg-brand/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-40 bottom-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6 lg:px-12 pt-20 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-xl bg-brand rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <div className="relative w-full h-full rounded-xl bg-brand-dark flex items-center justify-center font-extrabold text-white text-lg shadow-brand-sm">
                  V
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg leading-none text-white">Vichakra</span>
                <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase leading-none mt-0.5">
                  Technologies
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Crafting end-to-end technology solutions that empower businesses to scale, innovate, and lead in their industries globally.
            </p>

            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand/20 hover:text-brand border border-white/5 hover:border-brand/30 flex items-center justify-center text-gray-400 transition-all duration-300"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-semibold text-white text-xs tracking-widest uppercase mb-6">Navigation</h5>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors duration-200"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-brand/0 group-hover:text-brand -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5 className="font-semibold text-white text-xs tracking-widest uppercase mb-6">Services</h5>
            <ul className="space-y-3.5">
              {services.map((s) => (
                <li key={s} className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand/60 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold text-white text-xs tracking-widest uppercase mb-6">Get in Touch</h5>
            <ul className="space-y-5">
              <li>
                <a
                  href="mailto:hello@vichakratech.com"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-brand transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors mt-0.5">
                    <Mail size={14} className="text-brand" />
                  </span>
                  <div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Email</div>
                    hello@vichakratech.com
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-brand" />
                </span>
                <div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Location</div>
                  Hyderabad, India
                </div>
              </li>
            </ul>

            {/* Availability badge */}
            <div className="mt-6 p-4 rounded-xl bg-brand/10 border border-brand/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-brand font-bold uppercase tracking-wider">Available for Projects</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">Now accepting new client engagements for Q2 2026.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Vichakra Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={12} className="text-brand fill-brand" /> for world-class businesses
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
