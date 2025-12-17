import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Award,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  ExternalLink,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading: boolean;
  coachData: any;
}

const CoachProfileDialog = ({
  open,
  onOpenChange,
  loading,
  coachData,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Coach Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">
                Loading coach information...
              </p>
            </div>
          </div>
        ) : coachData ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="w-24 h-24 ring-2 ring-primary/20">
                <AvatarImage
                  src={
                    coachData.avatar_url?.trim()
                      ? coachData.avatar_url
                      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                  }
                  alt={coachData.full_name}
                />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {coachData.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {coachData.full_name}
                </h2>
                <p className="text-lg text-primary font-medium">
                  Fitness & Wellness Coach
                </p>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-foreground">
                      4.8
                    </span>
                    <span>(127 reviews)</span>
                  </div>
                  <span>•</span>
                  <span>5+ years experience</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {coachData.bio}
              </p>
            </div>

            {/* Skills */}
            {coachData.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Skills & Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {coachData.skills.map((skill: string, idx: number) => (
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
            {coachData.certifications?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {coachData.certifications.map(
                    (cert: any, idx: number) => (
                      <Card
                        key={idx}
                        className="border-l-4 border-l-primary/50"
                      >
                        <CardContent className="p-3">
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.year}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {coachData.socials?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {coachData.socials.map((social: any, idx: number) => {
                    const socialIcons: any = {
                      Instagram,
                      LinkedIn: Linkedin,
                      YouTube: Youtube,
                      Website: Globe,
                    };
                    const IconComponent =
                      socialIcons[social.platform] || ExternalLink;

                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          window.open(social.url, "_blank")
                        }
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
            <p className="text-muted-foreground">
              Coach information not available.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoachProfileDialog;
