import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import BlogTimeline from './BlogTimeline';

const BlogTimelineSheet = ({ posts, isOpen, onOpenChange, onReadMore, isMobile }) => {
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="p-4">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">This Just In</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <BlogTimeline posts={posts} onReadMore={onReadMore} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[450px] sm:w-[500px] p-6">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">This Just In</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <BlogTimeline posts={posts} onReadMore={onReadMore} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BlogTimelineSheet;
