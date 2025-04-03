
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, Send, Clock, Smile, MoreVertical, Trash2, Edit, PaperclipIcon, FileIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CollaborationService, TaskComment, TaskReaction } from '@/services/collaborationService';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface TaskCommentsProps {
  taskId: string;
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      const taskComments = await CollaborationService.getTaskComments(taskId);
      setComments(taskComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    setIsLoading(true);
    try {
      const comment = await CollaborationService.addTaskComment(
        taskId,
        newComment,
        currentUser.id
      );
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      await CollaborationService.deleteTaskComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };
  
  const handleEditComment = (comment: TaskComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };
  
  const saveEditedComment = async () => {
    if (!editingCommentId || !editContent.trim()) return;
    
    try {
      const updatedComment = await CollaborationService.updateTaskComment(
        editingCommentId,
        editContent
      );
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === editingCommentId 
            ? { ...comment, content: editContent, updatedAt: updatedComment.updatedAt } 
            : comment
        )
      );
      
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleAddReaction = async (commentId: string, emoji: string) => {
    if (!currentUser) return;
    
    try {
      const reaction = await CollaborationService.addReaction(
        taskId,
        emoji,
        commentId,
        currentUser.id
      );
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                reactions: [...(comment.reactions || []), reaction] 
              } 
            : comment
        )
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUploadAttachment = async () => {
    if (!selectedFile || !currentUser) {
      return;
    }
    
    setUploading(true);
    try {
      await CollaborationService.uploadTaskAttachment(
        taskId,
        selectedFile,
        currentUser.id
      );
      
      // Refresh comments to see the new attachment
      loadComments();
      toast.success('File attached successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Format date for display
  const formatCommentDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <MessageSquare className="mr-2 h-5 w-5" />
        <h2 className="text-lg font-medium">Comments</h2>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="h-[300px] p-4">
          {isLoading && comments.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to comment on this task</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{comment.userName}</span>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {formatCommentDate(comment.createdAt)}
                              {comment.updatedAt && ' (edited)'}
                            </span>
                          </div>
                        </div>
                        
                        {comment.userId === currentUser?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Comment
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="mt-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={saveEditedComment}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 whitespace-pre-line break-words">
                          {comment.content}
                        </div>
                      )}
                      
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {comment.attachments.map(attachment => (
                            <div 
                              key={attachment.id}
                              className="flex items-center p-2 bg-background rounded border"
                            >
                              <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">
                                  {attachment.fileName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(attachment.fileSize / 1024)} KB
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="ml-2"
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex mt-1 gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Smile className="h-3 w-3 mr-1" />
                            <span className="text-xs">React</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-2" align="start">
                          <div className="flex flex-wrap gap-2">
                            {['👍', '👎', '😊', '🎉', '❤️', '😂', '🤔', '👀'].map(emoji => (
                              <button
                                key={emoji}
                                className="text-lg hover:bg-accent p-1 rounded"
                                onClick={() => {
                                  handleAddReaction(comment.id, emoji);
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      {/* Display reactions */}
                      {comment.reactions && comment.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {comment.reactions.map(reaction => (
                            <div 
                              key={reaction.id}
                              className="text-xs bg-accent rounded-full px-2 py-0.5 flex items-center"
                            >
                              <span className="mr-1">{reaction.emoji}</span>
                              <span className="text-[10px]">{reaction.userName.split(' ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>
                {currentUser?.displayName ? getInitials(currentUser.displayName) : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={isLoading || !newComment.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="ghost" size="sm" type="button" className="h-7 px-2">
                      <PaperclipIcon className="h-3 w-3 mr-1" />
                      <span className="text-xs">Attach</span>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </Button>
                  </label>
                  
                  {selectedFile && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-1 ml-1"
                        onClick={handleUploadAttachment}
                        disabled={uploading}
                      >
                        Upload
                      </Button>
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
