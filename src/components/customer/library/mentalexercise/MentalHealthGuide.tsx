// src/components/customer/library/mentalexercise/MentalHealthGuide.tsx

import { MentalHealthGuide as Guide } from "@/mockdata/library/mockmentalexercises";
import { Check, Sparkles } from "lucide-react";

export default function MentalHealthGuide({ guide }: { guide: Guide }) {
  return (
    <div className="w-full space-y-6 sm:rounded-2xl sm:bg-card sm:border sm:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{guide.name}</h2>
        <p className="mt-1 text-muted-foreground">{guide.description}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Benefits</h3>
        </div>
        <ul className="space-y-2">
          {guide.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2">How to Perform</h3>
        <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
          {guide.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
