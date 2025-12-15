// src/components/customer/mycoach/CoachBioDrawer.tsx
import { Card, CardContent } from '@/components/ui/card';
import { coachInfo } from '@/mockdata/mycoach/coachData';
import { Badge } from '@/components/ui/badge';
import { CircleUserRound } from 'lucide-react';

const CoachBioDrawer = () => {
    return (
        <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Coach Header Section */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full flex-shrink-0 bg-gray-200 overflow-hidden shadow-md">
                    {coachInfo.profileImageUrl ? (
                        <img src={coachInfo.profileImageUrl} alt={coachInfo.name} className="object-cover w-full h-full" />
                    ) : (
                        <CircleUserRound className="w-16 h-16 text-primary" />
                    )}
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{coachInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">Certified Coach</p>
                </div>
            </div>

            {/* Bio Section */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-foreground border-l-4 border-primary/50 pl-3">Bio</h3>
                <p className="text-muted-foreground leading-relaxed">
                    {coachInfo.bio}
                </p>
            </section>

            {/* Expertise Section */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-foreground border-l-4 border-primary/50 pl-3">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                    {coachInfo.specialties.map(specialty => (
                        <Badge key={specialty} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{specialty}</Badge>
                    ))}
                </div>
            </section>

            {/* Certificates Section */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-foreground border-l-4 border-primary/50 pl-3">Certificates</h3>
                <Card className="shadow-lg border-none bg-accent/50">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                        No certificates added yet.
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};

export default CoachBioDrawer;
