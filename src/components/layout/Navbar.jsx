import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button, cn } from '../ui/Button';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Why Us', path: '/why-us' },
  { name: 'Our Flow', path: '/our-flow' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const isActive = (path) => {
    if (path.includes('#')) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/70 py-3 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.08)]'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group z-10"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 bg-white">
              <img 
                src="/logo.svg" 
                alt="Vichakra Logo" 
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-none tracking-tight text-gray-900 group-hover:text-brand transition-colors duration-300">
                Vichakra
              </span>
              <span className="text-[10px] font-medium tracking-widest text-gray-400 uppercase leading-none mt-0.5">
                Technologies
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand transition-colors duration-200 group"
                >
                  {link.name}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors duration-200 group',
                    isActive(link.path) ? 'text-brand' : 'text-gray-600 hover:text-brand'
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      'absolute bottom-1 left-4 right-4 h-0.5 bg-brand transition-transform duration-300 origin-left rounded-full',
                      isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              href="/contact"
              size="sm"
              tooltip="Start your project today"
              className="font-semibold"
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>

          {/* Mobile Toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <span className="font-bold text-lg text-gray-900">Menu</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {link.path.startsWith('/#') ? (
                      <a
                        href={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 hover:bg-brand/5 hover:text-brand font-medium transition-all"
                      >
                        {link.name}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className={cn(
                          'flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all',
                          isActive(link.path)
                            ? 'bg-brand/10 text-brand'
                            : 'text-gray-700 hover:bg-brand/5 hover:text-brand'
                        )}
                      >
                        {link.name}
                        <ChevronRight className={cn('w-4 h-4', isActive(link.path) ? 'text-brand' : 'text-gray-400')} />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>
              <div className="p-6 border-t border-gray-100">
                <Button href="/contact" size="lg" className="w-full">
                  Get Started
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
