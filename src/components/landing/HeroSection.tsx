import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

import heroImage1 from '@/assets/hero-image1.webp';
import heroImage2 from '@/assets/hero-image2.webp';
import heroImage3 from '@/assets/hero-image3.webp';

const carouselData = [
  {
    image: heroImage1,
    title: "Eat Better. Live Better.",
    description:
      "Food should fuel joy, not stress. Discover how to eat smarter without dieting—so you feel amazing, have more energy, and still enjoy every bite.",
  },
  {
    image: heroImage2,
    title: "Strong Starts Here",
    description:
      "Fitness isn’t about size—it’s about unlocking your energy, confidence, and power. Step into movement that feels good and finally see results that stick.",
  },
  {
    image: heroImage3,
    title: "Your Calm, Your Power",
    description:
      "A clear, focused mind changes everything. Learn simple tools to release stress, boost resilience, and build the inner strength that fuels success.",
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsTextVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselData.length);
        setIsTextVisible(true);
      }, 700); // sync with fade-out
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentSlide = carouselData[currentIndex];

  const textGlow = {
    textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
  };

  return (
    <section id="hero" className="light relative h-screen flex items-center">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {carouselData.map((slide, index) => (
          <img
            key={slide.title}
            src={slide.image}
            alt={slide.title}
            decoding="async"
            loading="lazy"
            className={cn(
              "w-full h-full object-cover absolute transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Softer overlay for better contrast */}
        <div className="absolute inset-0 bg-black/16" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-start">
        <div className="max-w-xl text-center md:text-left">
          <div
            className={cn(
              "transition-opacity duration-700 ease-in-out",
              isTextVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tighter text-white"
              style={textGlow}
            >
              {currentSlide.title}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/90" style={textGlow}>
              {currentSlide.description}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center md:items-start">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-primary text-primary-foreground transition-transform hover:scale-105 shadow-2xl shadow-primary/30"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-4 text-sm text-white/80" style={textGlow}>
              7-day free trial · No credit card required
            </p>
          </div>

          {/* Rating */}
          <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
            <div className="flex items-center text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-sm font-medium text-white/90" style={textGlow}>
              Rated <span className="font-bold text-white">4.9/5</span> by 1,000+ users
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
