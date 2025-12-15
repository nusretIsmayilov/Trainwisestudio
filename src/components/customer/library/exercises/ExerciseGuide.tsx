// src/components/customer/library/exercises/ExerciseGuide.tsx

import { ExerciseGuide as ExerciseGuideData } from "@/mockdata/library/mockexercises";
import OptimizedMedia from "@/components/ui/OptimizedMedia";

interface ExerciseGuideProps {
  guide: ExerciseGuideData;
}

// Helper for list items (Benefits, Mistakes, etc.)
const InfoListItem = ({ icon, children }: { icon: React.ReactNode, children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="mt-1 text-primary">{icon}</span>
    <span className="flex-1 text-muted-foreground">{children}</span>
  </li>
);

// Helper for instruction steps
const InstructionStep = ({ index, children }: { index: number, children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
            {index + 1}
        </span>
        <span className="flex-1 text-muted-foreground">{children}</span>
    </li>
);

// Helper to create styled sections
const InfoSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="py-4 border-t border-border first:border-t-0 first:pt-0 last:pb-0">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <span>{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);


export default function ExerciseGuide({ guide }: ExerciseGuideProps) {
  return (
    <div className="w-full">
      {/* 1. Optimized Media Player at the top */}
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-lg">
        <OptimizedMedia
          imageUrl={guide.imageUrl}
          videoUrl={guide.videoUrl}
          alt={guide.name}
        />
      </div>

      {/* 2. Content card that "underlaps" the media */}
      <div className="relative bg-card rounded-t-3xl -mt-8 p-4 pt-8 md:p-6 md:pt-10 space-y-6">
        <div className="text-center px-2">
            <h2 className="text-3xl font-bold tracking-tight">{guide.name}</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{guide.description}</p>
        </div>
        
        <div className="space-y-2">
            <InfoSection icon="💪" title="What it's good for">
                <ul className="space-y-2">
                    {guide.benefits.map((benefit, i) => <InfoListItem key={i} icon="▪">{benefit}</InfoListItem>)}
                </ul>
            </InfoSection>

            <InfoSection icon="🧠" title="How to do it">
                <ol className="space-y-4">
                    {guide.instructions.map((step, i) => <InstructionStep key={i} index={i}>{step}</InstructionStep>)}
                </ol>
            </InfoSection>

            {guide.proTip && (
                <InfoSection icon="💡" title="Pro tip">
                    <p className="text-muted-foreground">{guide.proTip}</p>
                </InfoSection>
            )}

            <InfoSection icon="⚠️" title="Avoid these mistakes">
                <ul className="space-y-2">
                    {guide.commonMistakes.map((mistake, i) => <InfoListItem key={i} icon="❌">{mistake}</InfoListItem>)}
                </ul>
            </InfoSection>
            
            <InfoSection icon="🎯" title="For best results">
                <ul className="space-y-2">
                    {guide.forBestResults.map((tip, i) => <InfoListItem key={i} icon="✅">{tip}</InfoListItem>)}
                </ul>
            </InfoSection>
        </div>
      </div>
    </div>
  );
}
