'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TESTIMONIALS } from '@/mockdata/landingpage/testimonials';

export default function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.overflowY = 'hidden';
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return;

    let timer: number | undefined;

    const stepOnce = () => {
      const card = el.querySelector<HTMLElement>('[data-card]');
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseInt(getComputedStyle(el).gap || '16', 10) || 16;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 2;
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => {
        if (!pauseRef.current) stepOnce();
      }, 3500);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
    };

    const pause = () => (pauseRef.current = true);
    const resume = () => (pauseRef.current = false);

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);

    const onResize = () => {
      pause();
      setTimeout(resume, 200);
    };
    window.addEventListener('resize', onResize, { passive: true });

    start();

    return () => {
      stop();
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', resume);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section
      id="testimonials"
      aria-label="Client testimonials"
      className="light bg-white py-24 lg:pb-36 overflow-visible"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-reveal>
          <p className="text-primary font-semibold mb-2">Testimonials</p>
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter text-foreground">
            Real Stories, Real Results
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find out how our members have transformed their lives with our holistic approach.
          </p>
        </div>

        {/* Scrolling testimonial cards */}
        <div
          ref={trackRef}
          role="list"
          className="
            flex items-stretch gap-6
            overflow-x-auto overflow-y-hidden
            snap-x snap-mandatory
            scrollbar-hide-tablet
            scroll-px-4
            pb-12 lg:pb-16
          "
        >
          {TESTIMONIALS.map((t, idx) => (
            <article
              data-card
              key={`${t.name}-${idx}`}
              role="listitem"
              tabIndex={0}
              className={cn(
                'relative snap-center flex-shrink-0 p-8 rounded-3xl shadow-lg flex flex-col',
                'w-[calc(100%-2rem)] sm:w-[540px] lg:w-[600px]',
                t.dark
                  ? 'bg-foreground text-white'
                  : 'bg-white text-foreground border'
              )}
            >
              {/* Plan Badge */}
              <span
                className={cn(
                  'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold',
                  t.title.includes('Premium')
                    ? 'bg-blue-500 text-white'
                    : 'bg-green-500 text-white'
                )}
              >
                {t.title.split(' ')[0]}
              </span>

              {t.highlight && (
                <div className="mb-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                    {t.highlight}
                  </h3>
                </div>
              )}

              <blockquote className="flex-grow space-y-4">
                <p
                  className={cn(
                    'text-5xl leading-none',
                    t.dark ? 'text-white/50' : 'text-muted-foreground/50'
                  )}
                >
                  “
                </p>
                <p
                  className={cn(
                    'text-base leading-relaxed',
                    t.dark ? 'text-white/80' : 'text-muted-foreground'
                  )}
                >
                  {t.quote}
                </p>
              </blockquote>

              <footer className="mt-8 flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <p
                    className={cn(
                      'text-sm',
                      t.dark ? 'text-white/60' : 'text-muted-foreground'
                    )}
                  >
                    {t.title}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
