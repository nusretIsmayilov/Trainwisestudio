import { useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { WorkoutExercise, ExerciseSet } from "@/mockdata/viewprograms/mockexerciseprograms";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Timer, PlusCircle, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseDetailsProps {
  exercise: WorkoutExercise;
  onSetChange: (setIndex: number, updatedSet: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
}

// PerformanceInsight component remains the same.
const PerformanceInsight = ({ sets }: { sets: ExerciseSet[] }) => {
  const stats = useMemo(() => {
    let previousTotalKg = 0, previousSetsCount = 0, currentTotalKg = 0, currentSetsCount = 0;
    sets.forEach(set => {
      if (set.previous && set.previous.includes('@')) {
        const kg = parseFloat(set.previous.split('@')[1]);
        if (!isNaN(kg)) { previousTotalKg += kg; previousSetsCount++; }
      }
      if (set.performedKg !== null && set.performedKg > 0) {
        currentTotalKg += set.performedKg; currentSetsCount++;
      }
    });
    if (previousSetsCount === 0) return null;
    const previousAvgKg = previousTotalKg / previousSetsCount;
    if (currentSetsCount === 0) return { text: `Last time you averaged ${previousAvgKg.toFixed(1)} kg.`, Icon: Minus, color: "text-muted-foreground" };
    const currentAvgKg = currentTotalKg / currentSetsCount;
    const trend = ((currentAvgKg - previousAvgKg) / previousAvgKg) * 100;
    if (trend > 1) return { text: `Up ${trend.toFixed(0)}% from last time!`, Icon: TrendingUp, color: "text-emerald-500" };
    if (trend < -1) return { text: `Down ${Math.abs(trend).toFixed(0)}% from last time.`, Icon: TrendingDown, color: "text-red-500" };
    return { text: "Maintaining your strength. Solid work!", Icon: Minus, color: "text-blue-500" };
  }, [sets]);

  if (!stats) return null;
  const { text, Icon, color } = stats;
  return (
    <div className={cn("flex items-center gap-2 mt-2 text-xs font-semibold font-sans", color)}>
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
};

const SetRow = ({ set, index, onSetChange, onRemoveSet, isOnlySet }: {
  set: ExerciseSet;
  index: number;
  onSetChange: (index: number, updatedSet: Partial<ExerciseSet>) => void;
  onRemoveSet: (index: number) => void;
  isOnlySet: boolean;
}) => {
  const controls = useAnimation();
  const getPreviousKg = (previousString: string) => {
    if (!previousString || !previousString.includes('@')) return "";
    return previousString.split('@')[1]?.trim().split(' ')[0] || "";
  };

  return (
    <div className="relative bg-background rounded-xl overflow-hidden">
      {!isOnlySet && (
        <motion.div
          className="absolute inset-0 bg-red-600 flex justify-end items-center pr-6 z-0"
          initial={{ opacity: 0 }}
          animate={controls}
        >
          <Trash2 className="h-6 w-6 text-white" />
        </motion.div>
      )}
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(event, info) => {
          controls.start({ opacity: info.offset.x < -20 ? 1 : 0 });
        }}
        onDragEnd={(event, info) => {
          if (info.offset.x < -80 && !isOnlySet) {
            onRemoveSet(index);
          }
          controls.start({ opacity: 0 });
        }}
        className="relative grid grid-cols-12 gap-2 items-center p-2 bg-background z-10"
      >
        {/* Set number */}
        <div className="col-span-2 text-center font-bold text-lg text-primary">{index + 1}</div>
        
        {/* KG smaller */}
        <div className="col-span-3">
          <Input
            type="number" inputMode="decimal"
            placeholder={getPreviousKg(set.previous)}
            value={set.performedKg ?? ""}
            onChange={(e) => onSetChange(index, { performedKg: parseFloat(e.target.value) || null })}
            className="no-spinner w-full h-11 text-center font-medium text-base bg-card border-2 border-transparent focus-visible:border-primary"
          />
        </div>

        {/* Reps stretched */}
        <div className="col-span-5">
          <Input
            type="number" inputMode="numeric"
            placeholder={set.targetReps}
            value={set.performedReps ?? ""}
            onChange={(e) => onSetChange(index, { performedReps: parseFloat(e.target.value) || null })}
            className="no-spinner w-full h-11 text-center font-medium text-base bg-card border-2 border-transparent focus-visible:border-primary"
          />
        </div>

        {/* Checkbox */}
        <div className="col-span-2 flex-shrink-0 flex justify-center">
          <Checkbox
            checked={set.completed}
            onCheckedChange={(checked) => onSetChange(index, { completed: !!checked })}
            className="h-8 w-8 rounded-full data-[state=checked]:bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
};


export default function ExerciseDetails({ exercise, onSetChange, onAddSet, onRemoveSet }: ExerciseDetailsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4 sm:rounded-2xl sm:bg-card sm:border sm:p-4">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 px-2 sm:px-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{exercise.name}</h2>
          <p className="text-sm font-semibold text-muted-foreground">
            {exercise.targetSets} Sets | Target: {exercise.sets[0]?.targetReps} Reps
          </p>
          <PerformanceInsight sets={exercise.sets} />
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground flex-shrink-0">
          <Timer className="h-4 w-4" />
          <span className="font-mono text-sm font-semibold">{formatTime(exercise.restTimeSeconds)}</span>
        </div>
      </div>
      
      {/* Header grid */}
      <div className="grid grid-cols-12 gap-2 px-2 text-xs font-bold uppercase text-muted-foreground">
        <div className="col-span-2 text-center">Set</div>
        <div className="col-span-3 text-center">KG</div>
        <div className="col-span-5 text-center">Reps</div>
        <div className="col-span-2 text-center">✓</div>
      </div>
      
      {/* Sets */}
      <div className="space-y-3">
        <AnimatePresence>
          {exercise.sets.map((set, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: -300, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="w-full"
            >
              <SetRow
                set={set}
                index={index}
                onSetChange={onSetChange}
                onRemoveSet={onRemoveSet}
                isOnlySet={exercise.sets.length <= 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add set button */}
      <div className="pt-2 px-2 sm:px-0">
        <Button
          onClick={onAddSet}
          variant="outline"
          className="w-full h-12 text-base rounded-xl"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
