import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageWithSender } from '@/hooks/useMessages';
import { OfferMessage } from './OfferMessage';
import { cn } from '@/lib/utils';
import { Download, File, Image, Video, Music } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  userRole?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  userRole
}) => {
  const isOffer = message.message_type === 'offer';
  const isSystem = message.message_type === 'system';
  
  // Check if message is a file
  const isFile = message.content.startsWith('[FILE:') && message.content.includes(':');
  
  const getFileInfo = () => {
    if (!isFile) return null;
    const match = message.content.match(/\[FILE:([^:]+):(.+)\]/);
    if (!match) return null;
    return {
      fileName: match[1],
      fileData: match[2]
    };
  };
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    }
    if (['mp4', 'avi', 'mov', 'webm'].includes(extension || '')) {
      return <Video className="w-4 h-4" />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
      return <Music className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };
  
  const handleDownload = () => {
    const fileInfo = getFileInfo();
    if (!fileInfo) return;
    
    const link = document.createElement('a');
    link.href = fileInfo.fileData;
    link.download = fileInfo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <Badge variant="secondary" className="text-xs px-3 py-1">
          {message.content}
        </Badge>
      </div>
    );
  }

  if (isOffer) {
    return (
      <OfferMessage
        message={message}
        isOwn={isOwn}
        userRole={userRole}
      />
    );
  }

  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar_url} />
          <AvatarFallback>
            {message.sender.full_name?.split(' ').map(n => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.full_name}
          </span>
        )}
        
        <div className={cn(
          "rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 max-w-full break-words",
          isOwn 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {isFile ? (
            <div className="flex items-center gap-2">
              {getFileIcon(getFileInfo()?.fileName || '')}
              <span className="text-xs sm:text-sm font-medium truncate">{getFileInfo()?.fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 w-6 p-0"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <p className="text-xs sm:text-sm">{message.content}</p>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};