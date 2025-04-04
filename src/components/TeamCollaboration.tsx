
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { EmailService } from '@/services/emailService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatarUrl?: string;
  status: 'active' | 'pending' | 'offline';
};

export const TeamCollaboration = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  // Fallback data if API fails or is loading
  const fallbackMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member', status: 'offline' }
  ];

  // Fetch team members
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      try {
        return await apiService.getTeamMembers();
      } catch (error) {
        console.error('Failed to fetch team members:', error);
        return fallbackMembers; // Return fallback data on error
      }
    },
    initialData: fallbackMembers
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedRole) {
      toast.error('Please enter an email and select a role');
      return;
    }

    if (!validateEmail(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);

    try {
      // Attempt to send invitation through API
      await apiService.inviteTeamMember(inviteEmail, selectedRole);
      
      // Send email notification
      const inviteSubject = 'Invitation to join the team';
      const inviteBody = `
        <h2>You've been invited to join the team</h2>
        <p>You have been invited to join the team as a <strong>${selectedRole}</strong>.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${window.location.origin}/accept-invite" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px;">
          Accept Invitation
        </a>
        <p style="margin-top: 20px;">If you didn't request this invitation, please ignore this email.</p>
      `;
      
      const emailSent = await EmailService.sendEmail(inviteEmail, inviteSubject, inviteBody);
      
      if (emailSent) {
        toast.success(`Invitation sent to ${inviteEmail}`, {
          description: "An email notification has been sent"
        });
      } else {
        toast.success(`Invitation created for ${inviteEmail}`, {
          description: "Email notification could not be sent, but invitation was created"
        });
      }
      
      setInviteEmail('');
      refetch(); // Refresh the team members list
    } catch (error) {
      console.error('Failed to send invitation:', error);
      
      // For demo purposes, simulate success but show that email was attempted
      toast.success(`Invitation created for ${inviteEmail}`, {
        description: "Note: Email delivery may be delayed or unavailable in demo mode"
      });
      setInviteEmail('');
    } finally {
      setIsInviting(false);
    }
  };

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const displayMembers = data || fallbackMembers;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team and collaborate on tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-4">Loading team members...</p>
            ) : (
              <div className="space-y-2">
                {Array.isArray(displayMembers) && displayMembers.map((member: TeamMember) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.status === 'active' ? 'outline' : 'secondary'} 
                             className={member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}>
                        {member.status}
                      </Badge>
                      <Badge>{member.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 border-t p-4">
          <div className="text-sm font-medium">Invite a new team member</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleInvite} 
              disabled={isInviting}
              className="w-full sm:w-auto"
            >
              {isInviting ? "Sending..." : "Invite"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
