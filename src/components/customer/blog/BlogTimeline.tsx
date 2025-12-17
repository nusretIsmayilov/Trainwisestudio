import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCoachProfile } from "@/components/coach/useCoachProfile";
import CoachProfileDialog from "@/components/coach/CoachProfileDialog";

const BlogTimeline = ({ posts, onReadMore }) => {
  const {
    open,
    loading,
    coachData,
    openCoach,
    setOpen,
  } = useCoachProfile();

  const handleAuthorClick = (authorId, event) => {
    event.stopPropagation(); // Prevent triggering the post click
    if (!authorId) return;
    openCoach(authorId);
  };

  return (
    <>
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div
            key={
              post && (post.slug || post.id)
                ? `${post.slug || post.id}`
                : `post-${index}`
            }
            className="cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg"
            onClick={() => onReadMore(post.slug)}
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={
                    post.imageUrl && !post.imageUrl.startsWith("blob:")
                      ? post.imageUrl
                      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
                  }
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
                  onClick={(e) =>
                    handleAuthorClick(post.author.id, e)
                  }
                >
                  By {post.author.name}
                </p>
                {/* Date and read time removed as requested */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coach Dialog – ORTAK KOMPONENT */}
      <CoachProfileDialog
        open={open}
        onOpenChange={setOpen}
        loading={loading}
        coachData={coachData}
      />
    </>
  );
};

export default BlogTimeline;
