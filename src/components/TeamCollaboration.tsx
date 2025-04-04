
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

  // Srihari as the team owner
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Srihari Dasari', email: 'srihari9dasari@gmail.com', role: 'owner', status: 'active' }
  ];

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
      // Send email invitation
      const emailSent = await EmailService.sendTeamInvitation(inviteEmail, selectedRole, 'Srihari Dasari');
      
      if (emailSent) {
        toast.success(`Invitation sent to ${inviteEmail}`, {
          description: "In a real application, they would receive an email with a link to accept"
        });
      } else {
        toast.error(`Could not send invitation to ${inviteEmail}`, {
          description: "Please check the email address and try again"
        });
      }
      
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team and collaborate on tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {teamMembers.map((member: TeamMember) => (
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
                    <Badge variant="outline" 
                           className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {member.status}
                    </Badge>
                    <Badge>{member.role}</Badge>
                  </div>
                </div>
              ))}
            </div>
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
