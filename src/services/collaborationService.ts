
/**
 * Collaboration Service
 * Provides functionalities for task comments, reactions, and sharing
 */

import { apiService } from './apiService';
import { toast } from 'sonner';

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  reactions?: TaskReaction[];
  attachments?: TaskAttachment[];
}

export interface TaskReaction {
  id: string;
  taskId: string;
  commentId?: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const CollaborationService = {
  /**
   * Get comments for a task
   * @param taskId Task ID to get comments for
   */
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    try {
      // For demo, return mock data
      // In a real app, this would call apiService.getTaskComments(taskId)
      return this.getMockComments(taskId);
    } catch (error) {
      console.error('Error getting task comments:', error);
      throw error;
    }
  },
  
  /**
   * Add a comment to a task
   * @param taskId Task ID to add comment to
   * @param content Comment content
   * @param userId User ID of the commenter
   */
  async addTaskComment(taskId: string, content: string, userId: string): Promise<TaskComment> {
    try {
      // In a real app, this would call apiService.addTaskComment
      const comment: TaskComment = {
        id: crypto.randomUUID(),
        taskId,
        userId,
        userName: 'Current User', // In a real app, this would come from the user profile
        content,
        createdAt: new Date().toISOString(),
        reactions: []
      };
      
      // For demo purposes, just return the comment
      return comment;
    } catch (error) {
      console.error('Error adding task comment:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing comment
   * @param commentId Comment ID to update
   * @param content New comment content
   */
  async updateTaskComment(commentId: string, content: string): Promise<TaskComment> {
    try {
      // In a real app, this would call apiService.updateTaskComment
      // For demo, just return mock data
      return {
        id: commentId,
        taskId: 'task-123',
        userId: 'user-123',
        userName: 'Current User',
        content,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating task comment:', error);
      throw error;
    }
  },
  
  /**
   * Delete a comment
   * @param commentId Comment ID to delete
   */
  async deleteTaskComment(commentId: string): Promise<boolean> {
    try {
      // In a real app, this would call apiService.deleteTaskComment
      // For demo, just return success
      return true;
    } catch (error) {
      console.error('Error deleting task comment:', error);
      throw error;
    }
  },
  
  /**
   * Add a reaction to a task or comment
   * @param taskId Task ID
   * @param emoji Emoji to add as reaction
   * @param commentId Optional comment ID (if reaction is to a comment)
   * @param userId User ID adding the reaction
   */
  async addReaction(
    taskId: string, 
    emoji: string, 
    commentId?: string, 
    userId: string = 'user-123'
  ): Promise<TaskReaction> {
    try {
      // In a real app, this would call apiService.addReaction
      const reaction: TaskReaction = {
        id: crypto.randomUUID(),
        taskId,
        commentId,
        userId,
        userName: 'Current User', // In a real app, this would come from the user profile
        emoji,
        createdAt: new Date().toISOString()
      };
      
      // For demo purposes, just return the reaction
      return reaction;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },
  
  /**
   * Remove a reaction
   * @param reactionId Reaction ID to remove
   */
  async removeReaction(reactionId: string): Promise<boolean> {
    try {
      // In a real app, this would call apiService.removeReaction
      // For demo, just return success
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },
  
  /**
   * Upload a file attachment to a task
   * @param taskId Task ID to attach file to
   * @param file File to upload
   * @param userId User ID uploading the file
   */
  async uploadTaskAttachment(taskId: string, file: File, userId: string): Promise<TaskAttachment> {
    try {
      // In a real app, this would call apiService.uploadTaskAttachment
      // For demo purposes, create a mock attachment
      const fileExtension = file.name.split('.').pop() || '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase());
      
      const attachment: TaskAttachment = {
        id: crypto.randomUUID(),
        taskId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: URL.createObjectURL(file),
        thumbnailUrl: isImage ? URL.createObjectURL(file) : undefined,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      };
      
      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },
  
  /**
   * Delete a file attachment
   * @param attachmentId Attachment ID to delete
   */
  async deleteTaskAttachment(attachmentId: string): Promise<boolean> {
    try {
      // In a real app, this would call apiService.deleteTaskAttachment
      // For demo, just return success
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  /**
   * Get task collaborators
   * @param taskId Task ID to get collaborators for
   */
  async getTaskCollaborators(taskId: string): Promise<any[]> {
    try {
      // In a real app, this would call apiService.getTaskCollaborators
      // For demo, return mock data
      return [
        {
          id: 'user-123',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: 'https://i.pravatar.cc/150?u=jane',
          role: 'editor'
        },
        {
          id: 'user-456',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://i.pravatar.cc/150?u=john',
          role: 'viewer'
        }
      ];
    } catch (error) {
      console.error('Error getting task collaborators:', error);
      throw error;
    }
  },

  /**
   * Generate mock comments for demo purposes
   * @param taskId Task ID to generate comments for
   */
  getMockComments(taskId: string): TaskComment[] {
    return [
      {
        id: 'comment-1',
        taskId,
        userId: 'user-456',
        userName: 'John Doe',
        userAvatar: 'https://i.pravatar.cc/150?u=john',
        content: 'I think we should prioritize this task for the next sprint.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        reactions: [
          {
            id: 'reaction-1',
            taskId,
            commentId: 'comment-1',
            userId: 'user-123',
            userName: 'Jane Smith',
            emoji: '👍',
            createdAt: new Date(Date.now() - 43200000).toISOString()
          }
        ]
      },
      {
        id: 'comment-2',
        taskId,
        userId: 'user-123',
        userName: 'Jane Smith',
        userAvatar: 'https://i.pravatar.cc/150?u=jane',
        content: 'I agree, let\'s plan to complete this by the end of the week.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        reactions: []
      }
    ];
  }
};
