'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Award, DollarSign, Globe, Instagram, Linkedin, Youtube, Twitter, Video, Facebook, ExternalLink } from 'lucide-react';
import { CoachProfile } from '@/hooks/useCoachProfile';
import { motion } from 'framer-motion';

interface ProfileViewModeProps {
  profile: CoachProfile;
  onEdit: () => void;
}

const SOCIAL_ICONS: Record<string, React.ComponentType<any>> = {
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  Twitter,
  TikTok: Video,
  Facebook,
  Website: Globe,
};

const SOCIAL_COLORS: Record<string, string> = {
  Instagram: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white',
  LinkedIn: 'hover:bg-blue-600 hover:text-white',
  YouTube: 'hover:bg-red-600 hover:text-white',
  Twitter: 'hover:bg-blue-400 hover:text-white',
  TikTok: 'hover:bg-black hover:text-white',
  Facebook: 'hover:bg-blue-700 hover:text-white',
  Website: 'hover:bg-primary hover:text-primary-foreground',
};

export const ProfileViewMode: React.FC<ProfileViewModeProps> = ({ profile, onEdit }) => {
  const formatPrice = (cents: number | null | undefined) => {
    if (!cents) return '—';
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Edit Button - Top Right */}
      <div className="flex justify-end">
        <Button onClick={onEdit} size="lg" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="shadow-md border-primary/20">
        <CardContent className="pt-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={profile.avatar_url || 'https://placehold.co/150x150/A0E7E5/030712?text=CP'}
              alt={profile.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/30 shadow-lg"
            />
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name || 'Your Name'}</h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {profile.tagline || 'Add a tagline to introduce yourself'}
                </p>
              </div>
              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.skills.slice(0, 6).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 6 && (
                    <Badge variant="outline" className="text-sm">
                      +{profile.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {profile.bio && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      {(profile.price_min_cents || profile.price_max_cents) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-5 w-5" />
              Coaching Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(profile.price_min_cents)} - {formatPrice(profile.price_max_cents)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Typical package price range
            </p>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Award className="h-5 w-5" />
              Certifications & Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.certifications.map((cert, idx) => (
                <div key={cert.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-2xl font-bold text-primary">{cert.year}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{cert.name}</h4>
                    {cert.issuer && (
                      <p className="text-sm text-muted-foreground mt-1">{cert.issuer}</p>
                    )}
                  </div>
                  <Award className="h-6 w-6 text-primary/50 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media Links */}
      {profile.socials.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5" />
              Connect With Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {profile.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.platform] || Globe;
                const colorClass = SOCIAL_COLORS[social.platform] || 'hover:bg-primary hover:text-primary-foreground';
                
                return (
                  <Button
                    key={social.id}
                    variant="outline"
                    size="lg"
                    className={`gap-2 transition-all ${colorClass}`}
                    asChild
                  >
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-5 w-5" />
                      {social.platform}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State Hints */}
      {!profile.bio && !profile.certifications.length && !profile.socials.length && (
        <Card className="shadow-md border-dashed border-2 border-primary/30">
          <CardContent className="pt-6 text-center space-y-2">
            <p className="text-muted-foreground">
              Complete your profile to attract more clients! Click "Edit Profile" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
