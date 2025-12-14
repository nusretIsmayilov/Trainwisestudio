import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Ruler, 
  Weight, 
  Heart,
  Copy,
  Target,
  Activity,
  Crown,
  Play,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useRealTimeClientData } from '@/hooks/useRealTimeClientData';
import { useClientStatus } from '@/hooks/useClientStatus';
import AwaitingOfferMessage from './AwaitingOfferMessage';
import { useTranslation } from 'react-i18next';

interface ClientProfileTabProps {
  client: any | null;
}

// ✅ New type definition for Program
interface Program {
  id: string;
  name: string;
  status: 'active' | 'scheduled';
  startDate?: string;
}

const ClientProfileTab: React.FC<ClientProfileTabProps> = ({ client }) => {
  const { clientData, loading } = useRealTimeClientData(client?.id);
  const { clientStatus } = useClientStatus(client?.id);
  const { t } = useTranslation();

  const handleCopyInfo = () => {
    if (!clientData) return;
    const info = `Client: ${clientData.full_name}\nAge: ${clientData.personalInfo.age || 'Not provided'}\nHeight: ${clientData.personalInfo.height}\nWeight: ${clientData.personalInfo.weight}\nGoals: ${clientData.goals.join(', ')}`;
    navigator.clipboard.writeText(info);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Check if client is waiting for an offer
  if (clientStatus?.status === 'waiting_offer') {
    return (
      <AwaitingOfferMessage 
        clientName={client?.full_name || client?.name || 'this client'} 
        onSendOffer={() => {
          // TODO: Implement send offer functionality
          console.log('Send offer clicked');
        }}
      />
    );
  }

  if (!clientData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('common.noDataAvailable')}</p>
      </div>
    );
  }

  const activePrograms = clientData.programs.filter(p => p.status === 'active');
  const scheduledPrograms = clientData.programs.filter(p => p.status === 'scheduled');
  const hasAnyProgram = activePrograms.length > 0 || scheduledPrograms.length > 0;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ✅ New Programs Container */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5" />
            Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasAnyProgram ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Missing a program</p>
                <p className="text-sm text-amber-700">This client doesn't have any assigned or scheduled programs yet.</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Active Program(s)</h4>
                {activePrograms.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {activePrograms.map(p => (
                      <div key={p.id} className="flex items-center gap-2 p-3 rounded-xl border bg-muted/30">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <Play className="h-3 w-3 mr-1" /> Active
                        </Badge>
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No active programs.</div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Scheduled Program(s)</h4>
                {scheduledPrograms.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {scheduledPrograms.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            <Clock className="h-3 w-3 mr-1" /> Scheduled
                          </Badge>
                          <span className="font-medium text-sm">{p.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{p.startDate ? new Date(p.startDate).toLocaleDateString() : 'TBD'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No scheduled programs.</div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={handleCopyInfo} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem icon={User} label="Name" value={clientData.full_name} />
            <InfoItem icon={Calendar} label="Age" value={clientData.personalInfo.age ? `${clientData.personalInfo.age} years old` : 'Not provided'} />
            <InfoItem icon={Heart} label="Gender" value={clientData.personalInfo.gender} />
            <InfoItem icon={Ruler} label="Height" value={clientData.personalInfo.height} />
            <InfoItem icon={Weight} label="Weight" value={clientData.personalInfo.weight} />
            <InfoItem icon={Phone} label="Phone" value={clientData.phone || 'Not provided'} />
            <InfoItem icon={Mail} label="Email" value={clientData.email} />
            {/* Real Membership Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="h-4 w-4 text-yellow-500" />
                Membership
              </div>
              {clientData.membership.hasPaymentPlan ? (
                <Badge className="rounded-full px-3 py-1 text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                  {clientData.plan} • {clientData.membership.daysLeft} days left
                </Badge>
              ) : (
                <Badge className="rounded-full px-3 py-1 text-xs bg-gray-100 text-gray-700 border-gray-200">
                  Free Plan
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals & Preferences */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            Goals & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Goals</h4>
            <div className="flex flex-wrap gap-2">
              {clientData.goals && clientData.goals.length > 0 ? (
                clientData.goals.map((goal: string, index: number) => (
                  <Badge key={index} className="rounded-full px-3 py-1 text-xs bg-blue-100 text-blue-700 border-blue-200">
                    {goal}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No goals specified</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Training Preferences</h4>
            <p className="text-sm">
              {clientData.preferences.likes && clientData.preferences.likes.length > 0 
                ? clientData.preferences.likes.join(', ')
                : 'No preferences specified'
              }
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Training Dislikes</h4>
            <p className="text-sm">
              {clientData.preferences.dislikes && clientData.preferences.dislikes.length > 0 
                ? clientData.preferences.dislikes.join(', ')
                : 'No dislikes specified'
              }
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Meditation Experience</h4>
            <p className="text-sm">{clientData.preferences.meditationExperience}</p>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-rose-500" />
            Health Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Allergies</h4>
            <div className="flex flex-wrap gap-2">
              {clientData.preferences.allergies && clientData.preferences.allergies.length > 0 ? (
                clientData.preferences.allergies.map((allergy: string, index: number) => (
                  <Badge key={index} className="rounded-full px-3 py-1 text-xs bg-amber-100 text-amber-700 border-amber-200">
                    {allergy}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No allergies specified</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Past Injuries</h4>
            <div className="flex flex-wrap gap-2">
              {clientData.preferences.injuries && clientData.preferences.injuries.length > 0 ? (
                clientData.preferences.injuries.map((injury: string, index: number) => (
                  <Badge key={index} className="rounded-full px-3 py-1 text-xs bg-rose-100 text-rose-700 border-rose-200">
                    {injury}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No injuries specified</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Generic info item
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export default ClientProfileTab;
