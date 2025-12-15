// src/components/customer/progress/CheckinTrendCard.tsx
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckinTrendCardProps {
    title: string;
    icon: string;
    value: string;
    data: any[];
    dataKey: string;
    color: string;
    gradient: string;
    insight: string;
    onClick: () => void;
}

export default function CheckinTrendCard({ title, icon, value, data, dataKey, gradient, insight, onClick }: CheckinTrendCardProps) {
    const latestValue = data.length > 0 ? data[data.length - 1][dataKey] : 0;
    const previousValue = data.length > 1 ? data[data.length - 2][dataKey] : 0;
    const trend = latestValue - previousValue;
    
    // Determine if we have enough data to show trends
    const hasEnoughData = data.length >= 2;
    
    return (
        <motion.div
            className={cn(
                "flex-shrink-0 w-64 h-48 p-4 rounded-2xl flex flex-col justify-between text-white bg-gradient-to-br cursor-pointer shadow-lg hover:scale-105 transition-transform duration-300",
                gradient
            )}
            onClick={onClick}
            whileHover={{ y: -5 }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-2xl">{icon}</p>
                    <p className="font-semibold text-white">{title}</p>
                </div>
                <div className="w-16 h-8 -mr-2">
                    {hasEnoughData ? (
                        <ResponsiveContainer>
                            <LineChart data={data}>
                                <Line 
                                    type="monotone" 
                                    dataKey={dataKey} 
                                    stroke="white" 
                                    strokeWidth={2} 
                                    dot={false}
                                    strokeOpacity={0.9}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-white/60 text-xs">No data</div>
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-white">{value.split(' ')[0]} <span className="text-lg font-normal opacity-80">{value.split(' ')[1]}</span></p>
                    {hasEnoughData && trend !== 0 && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            trend > 0 ? "text-green-200" : "text-red-200"
                        )}>
                            {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            <span>{Math.abs(trend).toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <p className="text-xs opacity-80 mt-1 text-white/90">{insight}</p>
            </div>
        </motion.div>
    );
}
