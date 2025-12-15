// src/components/customer/progress/SmartInsights.tsx
import { SmartInsight } from '@/mockdata/progress/mockProgressData';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const InsightCard = ({ insight }: { insight: SmartInsight }) => {
    const isPositive = insight.type === 'positive';
    return (
        <div className="flex-shrink-0 w-[280px] bg-background/50 dark:bg-white/10 p-4 rounded-xl flex items-start gap-4">
            <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                {isPositive ? <Lightbulb className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <p className="text-sm">{insight.text}</p>
        </div>
    );
};

export default function SmartInsights({ insights }: { insights: SmartInsight[] }) {
    return (
        <motion.div
             initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide-tablet">
                {insights.map(insight => <InsightCard key={insight.id} insight={insight} />)}
            </div>
        </motion.div>
    );
}
