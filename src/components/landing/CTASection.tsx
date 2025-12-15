import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ctaImage1 from '@/assets/cta-image1.webp';
import ctaImage2 from '@/assets/cta-image2.webp';

function BlurImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500 ease-in-out',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
      {!loaded && <div className="absolute inset-0 bg-gray-200/10" />}
    </div>
  );
}

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEmail('');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-[#DDF5F0] via-[#B2E0D9]/50 to-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Text & Form */}
          <div className="text-center lg:text-left" data-reveal>
            <p className="mb-3 font-semibold text-primary text-sm sm:text-base">
              Start Your Journey Today
            </p>
            <h2 className="mb-6 text-4xl sm:text-5xl font-extrabold tracking-tighter text-foreground leading-tight">
              Ready to Transform Your Life?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Enter your email to get started with a personalized plan and join a community
              focused on real, sustainable results.
            </p>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex max-w-md flex-col gap-4 sm:flex-row mx-auto lg:mx-0"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                  className="rounded-xl bg-card text-foreground placeholder:text-muted-foreground h-12"
                />
                <Button
                  type="submit"
                  className="btn-wellness-primary text-base px-8 py-3 whitespace-nowrap rounded-xl h-12"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Get Started'}
                </Button>
              </form>
            ) : (
              <p className="mt-4 text-green-600 font-medium" role="status">
                🎉 Thank you! We'll be in touch soon.
              </p>
            )}

            <p className="mt-3 text-xs text-muted-foreground max-w-md mx-auto lg:mx-0">
              By submitting, you agree to our{' '}
              <a href="/privacy" className="underline text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Right Image Stack */}
          <div
            className="relative flex justify-center lg:justify-end h-[400px] sm:h-[500px]"
            data-reveal
          >
            <div className="absolute w-[80%] sm:w-[60%] h-[90%] sm:h-full rounded-3xl shadow-2xl overflow-hidden">
              <BlurImage src={ctaImage1} alt="Athlete looking focused" />
            </div>

            <div className="absolute bottom-0 left-0 sm:left-auto sm:right-0 w-[60%] sm:w-[50%] h-[70%] sm:h-[80%] rounded-3xl shadow-2xl -translate-x-4 sm:translate-x-4 translate-y-4 sm:translate-y-8 lg:translate-y-12 bg-primary p-2 overflow-hidden">
              <BlurImage src={ctaImage2} alt="Athlete in action" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
