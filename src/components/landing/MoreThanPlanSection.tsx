import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MORE_THAN_PLAN_CARDS } from '@/mockdata/landingpage/morethanplan';
import HeroImage from '@/assets/more-than-plan-hero.webp';

// --- BlurImage Component ---
function BlurImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative w-full h-full', className)}>
      {!loaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse rounded-2xl" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

// --- FeatureCard Component ---
function FeatureCard({ feature }) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-11/12 sm:w-[320px] lg:w-full snap-center',
        'p-6 bg-white/90 backdrop-blur-sm border border-gray-100/50 rounded-xl shadow-lg',
        'transition-all duration-300 hover:shadow-2xl hover:border-primary/50',
        'lg:mb-6'
      )}
    >
      <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-base text-muted-foreground line-clamp-3">{feature.description}</p>
    </div>
  );
}

// --- Main Component ---
export default function ModernFeatureSection() {
  const features = MORE_THAN_PLAN_CARDS.slice(0, 4);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <p className="mb-2 font-semibold text-primary">Everything You Need</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground">
            More Than Just a Plan
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Go beyond workouts. Learn, connect, reflect, and track your full wellness journey with tools
            designed to support lasting change.
          </p>
        </div>

        {/* Layout: Cards above image */}
        <div className="lg:flex lg:items-center lg:gap-8 relative">
          {/* Feature Cards */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scroll-smooth pb-8 scroll-p-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:w-3/5 lg:mx-0 lg:px-0 lg:pb-0 z-20">
            {features.map((card) => (
              <FeatureCard key={card.title} feature={card} />
            ))}
          </div>

          {/* Hero Image - Right side, slightly bigger */}
          <div className="hidden lg:block lg:w-3/5 relative mt-8 lg:mt-0 lg:-ml-16">
            <div className="relative w-full aspect-[5/4] rounded-2xl overflow-hidden shadow-xl">
              <BlurImage src={HeroImage} alt="Comprehensive wellness platform dashboard" />
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          *Access to features like Coach Feedback and advanced tracking is available on our Premium plan.
        </p>
      </div>
    </section>
  );
}
