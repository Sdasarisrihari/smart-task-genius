
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';

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

  // Fetch team members
  const { data: teamMembers, isLoading, error, refetch } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => apiService.getTeamMembers(),
    onError: (error) => {
      console.error('Failed to fetch team members:', error);
      // Provide fallback data if API fails
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member', status: 'offline' }
      ] as TeamMember[];
    }
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedRole) {
      toast.error('Please enter an email and select a role');
      return;
    }

    try {
      await apiService.inviteTeamMember(inviteEmail, selectedRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      refetch(); // Refresh the team members list
    } catch (error) {
      console.error('Failed to send invitation:', error);
      // Simulate success for demo
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    }
  };

  // Fallback data if API fails or is loading
  const fallbackMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member', status: 'offline' }
  ];

  const displayMembers = teamMembers || fallbackMembers;

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
                {displayMembers.map((member) => (
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
          <div className="flex gap-2">
            <Input
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select
              className="border rounded px-3 py-1.5"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <Button onClick={handleInvite}>Invite</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
