import { useEffect, lazy, Suspense } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/landing/Footer';

// Lazy load below-the-fold sections
const MoreThanPlanSection = lazy(() => import('@/components/landing/MoreThanPlanSection'));
const HowItWorksSection = lazy(() => import('@/components/landing/HowItWorksSection'));
const TestimonialsSection = lazy(() => import('@/components/landing/TestimonialsSection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const CTASection = lazy(() => import('@/components/landing/CTASection'));

// Loading fallback component
const SectionLoader = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

// Scroll animation hook
function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('reveal-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('reveal-visible');
        }),
      { threshold: 0.1, rootMargin: '0px 0px -20% 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function LandingPage() {
  useRevealOnScroll();

  return (
    // Added "light" class to force light theme
    <div className="light min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <section id="features" aria-label="Core Features" data-reveal className="reveal">
          <FeaturesSection />
        </section>
        <section id="more-than-plan" aria-label="More Than a Plan" data-reveal className="reveal">
          <Suspense fallback={<SectionLoader />}>
            <MoreThanPlanSection />
          </Suspense>
        </section>
        <section id="how-it-works" aria-label="How It Works" data-reveal className="reveal">
          <Suspense fallback={<SectionLoader />}>
            <HowItWorksSection />
          </Suspense>
        </section>
        <section id="testimonials" aria-label="Testimonials" data-reveal className="reveal">
          <Suspense fallback={<SectionLoader />}>
            <TestimonialsSection />
          </Suspense>
        </section>
        <section id="pricing" aria-label="Pricing Plans" data-reveal className="reveal">
          <Suspense fallback={<SectionLoader />}>
            <PricingSection />
          </Suspense>
        </section>
        <section id="cta" aria-label="Call to Action" data-reveal className="reveal">
          <Suspense fallback={<SectionLoader />}>
            <CTASection />
          </Suspense>
        </section>
        
      </main>
      {/* Added "light" class to footer */}
      <footer className="light bg-card text-card-foreground border-t">
        <Footer />
      </footer>
    </div>
  );
}
