import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Award, Globe, Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const BlogTimeline = ({ posts, onReadMore }) => {
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuthorClick = async (authorId, event) => {
    event.stopPropagation(); // Prevent triggering the post click
    
    if (!authorId) return;
    
    setLoading(true);
    setIsCoachModalOpen(true);
    
    try {
      // Fetch coach data
      const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, bio, avatar_url, skills, certifications, socials, years_experience')
          .eq('id', authorId)
          .eq('role', 'coach')
          .single();

      if (error) {
          console.error('Error fetching coach data:', error);
          return;
      }

      setCoachData(data);
    } catch (error) {
      console.error('Error fetching coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div 
            key={(post && (post.slug || post.id)) ? `${post.slug || post.id}` : `post-${index}`}
            className="cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg" 
            onClick={() => onReadMore(post.slug)}
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={post.imageUrl && !post.imageUrl.startsWith('blob:') ? post.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-500 mb-1">
                  {post.category.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold leading-snug line-clamp-2">
                  {post.title}
                </h3>
                <p 
                  className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => handleAuthorClick(post.author.id, e)}
                >
                  By {post.author.name}
                </p>
                {/* Date and read time removed as requested */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coach Modal */}
      <Dialog open={isCoachModalOpen} onOpenChange={setIsCoachModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Coach Details</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Loading coach information...</p>
              </div>
            </div>
          ) : coachData ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 ring-2 ring-primary/20">
                  <AvatarImage src={coachData.avatar_url} alt={coachData.full_name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {coachData.full_name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{coachData.full_name}</h2>
                  <p className="text-lg text-primary font-medium">Fitness & Wellness Coach</p>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">4.8</span>
                      <span>(127 reviews)</span>
                    </div>
                    <span>•</span>
                    <span>{coachData.years_experience || 5}+ years experience</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">{coachData.bio}</p>
              </div>

              {/* Skills */}
              {coachData.skills && coachData.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Skills & Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {coachData.skills.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {coachData.certifications && coachData.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {coachData.certifications.map((cert, idx) => (
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
              {coachData.socials && coachData.socials.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-3">
                    {coachData.socials.map((social, idx) => {
                      const socialIcons = {
                        Instagram: Instagram,
                        LinkedIn: Linkedin,
                        YouTube: Youtube,
                        Website: Globe
                      };
                      const IconComponent = socialIcons[social.platform] || ExternalLink;
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
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Coach information not available.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogTimeline;
