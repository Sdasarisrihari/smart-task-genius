
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = React.useState(currentUser?.displayName || '');
  const [isEditing, setIsEditing] = React.useState(false);
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <Button onClick={() => navigate('/login')}>Sign In to Continue</Button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (displayName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    
    try {
      await updateProfile({ displayName });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>View and edit your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-medium text-primary">
                {currentUser.displayName?.charAt(0) || currentUser.email.charAt(0)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={currentUser.email} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            {isEditing ? (
              <Input 
                id="name" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            ) : (
              <Input id="name" value={currentUser.displayName} disabled />
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Account Created</Label>
            <div className="text-sm text-muted-foreground">
              {new Date(currentUser.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="w-1/2" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="w-1/2" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="w-1/2" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button variant="destructive" className="w-1/2" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
