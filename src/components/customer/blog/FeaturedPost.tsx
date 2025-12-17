import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Star,
  Award,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import CoachProfileDialog from "@/components/coach/CoachProfileDialog";
import { useCoachProfile } from "@/components/coach/useCoachProfile";

const FeaturedPost = ({ post, onReadMore }) => {
  const { open, loading, coachData, openCoach, setOpen } = useCoachProfile();

  return (
    <>
      <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl">
        <img
          src={
            post.imageUrl && !post.imageUrl.startsWith("blob:")
              ? post.imageUrl
              : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
          }
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover brightness-[.7] transition-transform duration-500 ease-in-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end h-full text-white">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base max-w-xl text-gray-200">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-300 font-medium">
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => openCoach(post.author.id)}
              >
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hover:underline">{post.author.name}</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="mt-4 px-6 py-3 rounded-full text-sm sm:text-base font-semibold"
              onClick={() => onReadMore(post.slug)}
            >
              Read Full Article
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Coach Dialog – TEK KOMPONENT */}
      <CoachProfileDialog
        open={open}
        onOpenChange={setOpen}
        loading={loading}
        coachData={coachData}
      />
    </>
  );
};

export default FeaturedPost;
