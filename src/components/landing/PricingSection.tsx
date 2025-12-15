import { Check, Sparkles, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/mockdata/landingpage/plans';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const PricingSection = () => {
  const plan = {
    name: PLANS[0].name,
    price: PLANS[0].price,
    oldPrice: PLANS[0].oldPrice,
    period: `/${PLANS[0].period}`,
    description: PLANS[0].summary,
    features: PLANS[0].features,
    cta: PLANS[0].ctaText,
    featured: true,
    badge: 'Complete Access',
    icon: Sparkles,
  };

  return (
    <section
      id="pricing"
      className="light relative py-20 bg-gradient-to-t from-[#DDF5F0] via-[#B2E0D9]/50 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12" data-reveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter text-foreground mb-4">
            Complete Access to Transform Your Life
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for fitness, nutrition, and mental wellness - all in one plan
          </p>
          <div className="mt-6 flex justify-center items-center gap-x-4 sm:gap-x-6 text-sm text-muted-foreground">
            <span>✓ Unlimited access to all features</span>
            <span className="text-primary">•</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>

        {/* Single Centered Plan Card */}
        <div className="flex justify-center" data-reveal>
          <div
            className="relative p-8 rounded-3xl border flex flex-col transition-all duration-300 max-w-xl w-full text-white border-primary/30 lg:scale-105 shadow-2xl shadow-primary/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"
          >
            {plan.badge && (
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 text-sm font-semibold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg bg-primary text-white">
                {plan.badge}
              </div>
            )}

            <div className="flex-grow pt-4">
              {plan.icon && (
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <plan.icon className="w-8 h-8 text-primary drop-shadow-[0_2px_8px_rgba(251,146,60,0.6)]" />
                  </div>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-3 text-center">{plan.name}</h3>
              <p className="text-base text-white/70 text-center mb-4">
                {plan.description}
              </p>

              <div className="my-6 flex flex-col items-center gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-white/70 text-lg">{plan.period}</span>
                </div>
                {plan.oldPrice && (
                  <div className="text-lg text-white/50 line-through">
                    {plan.oldPrice}
                  </div>
                )}
              </div>

              <ul className="space-y-3 text-left mb-6">
                {plan.features.map((feature: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {Array.isArray(feature.text) ? feature.text.join(' ') : feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/get-started"
              className="w-full mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-12 px-8 text-white bg-primary hover:bg-primary/90 border-0 shadow-lg shadow-primary/30"
            >
              {plan.cta}
            </Link>

            <div className="flex items-center justify-center gap-6 text-xs text-white/60 mt-3">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4" /> Cancel Anytime
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4" /> Secure Payment
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
