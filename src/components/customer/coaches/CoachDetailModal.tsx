import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RealTimeCoachData } from '@/hooks/useRealTimeCoachData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Award, Globe, Instagram, Linkedin, Youtube, ExternalLink, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CoachDetailModalProps {
  coach: RealTimeCoachData | null;
  isOpen: boolean;
  onClose: () => void;
  onRequest: (coach: RealTimeCoachData) => void;
  requestStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

const socialIcons = {
  Instagram: Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  Website: Globe
};

export const CoachDetailModal: React.FC<CoachDetailModalProps> = ({
  coach,
  isOpen,
  onClose,
  onRequest,
  requestStatus
}) => {
  if (!coach) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Coach Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 ring-2 ring-primary/20">
              <AvatarImage src={coach.avatar_url} alt={coach.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {coach.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{coach.name}</h2>
              <p className="text-lg text-primary font-medium">{coach.tagline}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-foreground">{coach.rating.toFixed(1)}</span>
                  <span>({coach.reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>{coach.yearsExperience}+ years experience</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground leading-relaxed">{coach.bio}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Skills & Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {coach.skills.map((skill, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {skill}
                </Badge>
              ))}
              {coach.skills.length === 0 && (
                <p className="text-muted-foreground">No skills listed yet.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          {coach.certifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </h3>
              <div className="space-y-2">
                {coach.certifications.map((cert, idx) => (
                  <Card key={idx} className="border-l-4 border-l-primary/50">
                    <CardContent className="p-3">
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cert.issuer} • {cert.year}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {coach.socials.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {coach.socials.map((social, idx) => {
                  const IconComponent = socialIcons[social.platform as keyof typeof socialIcons] || ExternalLink;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(social.url, '_blank')}
                    >
                      <IconComponent className="w-4 h-4" />
                      {social.platform}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => onRequest(coach)} 
              className="gap-2"
              disabled={requestStatus === 'pending' || requestStatus === 'accepted'}
              variant={requestStatus === 'rejected' ? 'outline' : 'default'}
            >
              <MessageSquare className="w-4 h-4" />
              {requestStatus === 'pending' && 'Request Sent'}
              {requestStatus === 'accepted' && 'Coach Assigned'}
              {requestStatus === 'rejected' && 'Send Request'}
              {!requestStatus && 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};