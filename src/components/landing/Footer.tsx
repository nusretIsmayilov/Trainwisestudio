import { Instagram, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-white">TrainWiseStudio</span>
            </div>
            <p className="max-w-xs text-sm text-white/70">
              Transform your life through personalized fitness, nutrition, and mental wellness coaching.
            </p>
          </div>

          {/* Link Columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Quick Links
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        onClick={(e) => handleScroll(e, link.href)}
                        className="text-sm text-white/60 transition-colors hover:text-primary"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Legal
                </h3>
                <ul className="mt-4 space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Contact
                </h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href="mailto:hello@trainwisestudio.com"
                      className="text-sm text-white/60 transition-colors hover:text-primary"
                    >
                      hello@trainwisestudio.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8 sm:flex sm:items-center sm:justify-between">
          <div className="flex space-x-6">
            <a
              href="https://instagram.com/trainwisestudio"
              className="text-white/60 transition-colors hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="mailto:hello@trainwisestudio.com"
              className="text-white/60 transition-colors hover:text-primary"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-6 w-6" />
            </a>
          </div>
          <p className="mt-8 text-sm text-white/60 sm:mt-0">
            &copy; {new Date().getFullYear()} TrainWiseStudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
