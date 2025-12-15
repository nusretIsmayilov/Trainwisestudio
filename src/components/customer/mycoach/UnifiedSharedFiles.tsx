// src/components/customer/mycoach/UnifiedSharedFiles.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, File, FileText, Image, Video, Music, Archive, Eye, FolderOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import useMediaQuery from '@/hooks/use-media-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Helper functions (Unchanged)
const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
        case 'doc':
        case 'docx':
            return FileText;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return Image;
        case 'mp4':
        case 'mov':
        case 'avi':
            return Video;
        case 'mp3':
        case 'wav':
        case 'flac':
            return Music;
        case 'zip':
        case 'rar':
        case '7z':
            return Archive;
        default:
            return File;
    }
};

const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'from-red-500/20 to-red-600/10 text-red-600';
        case 'doc':
        case 'docx':
            return 'from-blue-500/20 to-blue-600/10 text-blue-600';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return 'from-green-500/20 to-green-600/10 text-green-600';
        case 'mp4':
        case 'mov':
        case 'avi':
            return 'from-purple-500/20 to-purple-600/10 text-purple-600';
        case 'mp3':
        case 'wav':
        case 'flac':
            return 'from-orange-500/20 to-orange-600/10 text-orange-600';
        default:
            return 'from-primary/20 to-primary/10 text-primary';
    }
};

interface SharedFile {
    id: string;
    name: string;
    description: string;
    date: string;
    file_url?: string;
    file_type?: string;
}

interface FileItemProps {
    file: SharedFile;
    index: number;
}

const FileItem: React.FC<FileItemProps> = ({ file, index }) => {
    const Icon = getFileIcon(file.name);
    const colorClass = getFileTypeColor(file.name);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group"
        >
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-gradient-to-r hover:from-accent/5 hover:to-primary/5 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={cn(
                        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-[1.03]",
                        colorClass
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-medium text-foreground overflow-hidden whitespace-nowrap text-ellipsis group-hover:text-primary transition-colors">
                            {file.name}
                        </h4>
                        <p className="text-sm text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis">
                            {file.description}
                        </p>
                        <p className="text-xs text-muted-foreground opacity-70">
                            Shared {file.date}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {file.file_url && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-70 hover:opacity-100 transition-all hover:bg-primary/10 p-2 h-auto"
                                aria-label="View File"
                                onClick={() => window.open(file.file_url, '_blank')}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-70 hover:opacity-100 transition-all hover:bg-primary/10 p-2 h-auto"
                                aria-label="Download File"
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = file.file_url!;
                                    link.download = file.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

interface FileListProps {
    isDrawer?: boolean;
}

const FileList: React.FC<FileListProps & { files: SharedFile[] }> = ({ isDrawer = false, files }) => {
    if (files.length === 0) {
        return (
            <Card className="shadow-lg border-0 rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">No files yet</h4>
                    <p className="text-muted-foreground text-sm">
                        Your coach hasn't shared any files with you yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {files.map((file, index) => (
                <FileItem key={file.id} file={file} index={index} />
            ))}
        </div>
    );
};

interface UnifiedSharedFilesProps {
    className?: string;
    onViewAll?: () => void;
}

const UnifiedSharedFiles: React.FC<UnifiedSharedFilesProps> = ({ className, onViewAll }) => {
    const { profile } = useAuth();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSharedFiles = async () => {
            if (!profile?.coach_id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Fetch real-time shared files from the database
                const { data, error } = await supabase
                    .from('shared_files')
                    .select('*')
                    .eq('coach_id', profile.coach_id)
                    .eq('customer_id', profile.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching shared files:', error);
                    setSharedFiles([]);
                    return;
                }

                // Transform the data to match our interface
                const transformedFiles: SharedFile[] = (data || []).map(file => ({
                    id: file.id,
                    name: file.file_name,
                    description: file.file_description || 'No description provided',
                    date: new Date(file.created_at).toLocaleDateString(),
                    file_url: file.file_url,
                    file_type: file.file_type
                }));

                setSharedFiles(transformedFiles);
            } catch (error) {
                console.error('Error fetching shared files:', error);
                setSharedFiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSharedFiles();
    }, [profile?.coach_id, profile?.id]);

    // Limit files shown in the desktop widget view (3)
    const filesToShow = isMobile ? sharedFiles.length : 3;

    if (loading) {
        return (
            <Card className={cn("shadow-xl border-0 rounded-2xl animate-fade-in", className)}>
                <CardContent className="flex items-center justify-center p-12">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading shared files...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("shadow-xl border-0 rounded-2xl animate-fade-in", className)}>
            <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <File className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-semibold">Shared Files</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {sharedFiles.length} file{sharedFiles.length !== 1 ? 's' : ''} shared
                            </p>
                        </div>
                    </div>
                    {sharedFiles.length > filesToShow && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary/5"
                            onClick={onViewAll}
                        >
                            View All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <FileList files={sharedFiles.slice(0, filesToShow)} />
            </CardContent>
        </Card>
    );
};

// Drawer Content Component for mobile (Uses the un-truncated FileList)
export const SharedFilesDrawerContent = () => {
    const { profile } = useAuth();
    const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSharedFiles = async () => {
            if (!profile?.coach_id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // For now, return empty array to show "no files" state
                setSharedFiles([]);
            } catch (error) {
                console.error('Error fetching shared files:', error);
                setSharedFiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSharedFiles();
    }, [profile?.coach_id]);

    if (loading) {
        return (
            <div className="h-full overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading shared files...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <File className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Shared Files</h3>
                    <p className="text-sm text-muted-foreground">
                        {sharedFiles.length} file{sharedFiles.length !== 1 ? 's' : ''} from your coach
                    </p>
                </div>
            </div>
            <Separator />
            <FileList isDrawer={true} files={sharedFiles} />
        </div>
    );
};

export default UnifiedSharedFiles;
