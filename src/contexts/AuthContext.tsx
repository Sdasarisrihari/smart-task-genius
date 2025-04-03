
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  socialLogin: (provider: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<{[email: string]: number}>({});

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Convert date strings back to Date objects
          parsedUser.createdAt = new Date(parsedUser.createdAt);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error retrieving user:", error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Enhanced security check - rate limit login attempts
      const attempts = loginAttempts[email] || 0;
      if (attempts >= 5) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      // In a real app, this would call an API
      // Simulating authentication for demo purposes
      if (email && password) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = existingUsers.find((u: any) => u.email === email);
        
        if (!user || user.password !== password) {
          // Track failed login attempts
          setLoginAttempts(prev => ({
            ...prev,
            [email]: (prev[email] || 0) + 1
          }));
          
          throw new Error('Invalid email or password');
        }
        
        // Reset login attempts on successful login
        setLoginAttempts(prev => ({
          ...prev,
          [email]: 0
        }));
        
        const { password: _, ...userWithoutPassword } = user;
        const authenticatedUser = {
          ...userWithoutPassword,
          createdAt: new Date(userWithoutPassword.createdAt)
        };
        
        setCurrentUser(authenticatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        toast.success("Successfully logged in!");
      } else {
        throw new Error('Email and password are required');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      // In a real app, this would call an API
      // Simulating registration for demo purposes
      if (!email || !password || !displayName) {
        throw new Error('All fields are required');
      }
      
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.some((u: any) => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In real app, this would be hashed
        displayName,
        createdAt: new Date()
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // In a real app, this would call an API or clear tokens
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setIsAuthenticated(false);
      toast.success("Successfully logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      if (!currentUser) throw new Error('No user logged in');
      
      const updatedUser = { ...currentUser, ...data, updatedAt: new Date() };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in users array too
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = existingUsers.map((u: any) => 
        u.id === currentUser.id ? { ...u, ...data } : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // In a real app, this would send an email with a reset link
      // For demo purposes, we'll just update the password to a default
      if (!email) throw new Error('Email is required');
      
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.email === email);
      
      if (userIndex === -1) {
        // In a real app, we wouldn't reveal that the user doesn't exist for security reasons
        // But we'd still pretend the reset email was sent
        console.log("User not found, but not revealing this to the caller");
        return;
      }
      
      // In a real app, we'd send an email with a reset link
      console.log(`Password reset requested for ${email}`);
      
      // For demo purposes, we're simulating the reset by setting a new password
      // This part would normally happen when the user clicks the reset link
      existingUsers[userIndex].password = "newpassword123";
      localStorage.setItem('users', JSON.stringify(existingUsers));
    } catch (error: any) {
      console.error("Error in resetPassword:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const socialLogin = async (provider: string) => {
    try {
      setLoading(true);
      // In a real app, this would handle OAuth flow with the provider
      console.log(`Logging in with ${provider}`);
      
      // For demo purposes, create/login a demo social user
      const socialEmail = `demo-${provider.toLowerCase()}@example.com`;
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let user = existingUsers.find((u: any) => u.email === socialEmail);
      
      if (!user) {
        // Create a new user for this social login
        user = {
          id: crypto.randomUUID(),
          email: socialEmail,
          password: crypto.randomUUID(), // Random password that won't be used
          displayName: `${provider} User`,
          createdAt: new Date(),
          socialProvider: provider
        };
        
        existingUsers.push(user);
        localStorage.setItem('users', JSON.stringify(existingUsers));
      }
      
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser({
        ...userWithoutPassword,
        createdAt: new Date(userWithoutPassword.createdAt)
      });
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    socialLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
