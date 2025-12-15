
import React, { useState, useEffect } from 'react';
import backgroundImage from '@/assets/backgroundImage.webp'; // adjust path if different

const testimonials = [
  { text: '"Clear plans, zero guesswork. Love the guidance."', author: 'Jonas' },
  { text: '"I finally stayed consistent for 6 weeks straight."', author: 'Mia' },
  { text: '"Workouts, meals, and mindset—all in one place."', author: 'Leo' },
];

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-[100svh] w-full bg-background antialiased">
      {/* LEFT: Branding Panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-emerald-50 to-teal-100 p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-gray-800 mb-4">
            A wellness system that fits your life.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Training, meals, and mental tools—everything in one app, built for momentum.
          </p>
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm transition-opacity duration-700 ease-in-out">
            <p className="italic text-slate-700">"{testimonials[current].text}"</p>
            <p className="mt-3 text-right font-semibold text-sm text-slate-600">— {testimonials[current].author}</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Form Panel with Background Image */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-4">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        ></div>

        {/* Overlay Layer for better contrast */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0" aria-hidden="true"></div>

        {/* Form Content Layer */}
        <div className="relative z-10 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
