import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Lock, User, Mail, Facebook } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, socialLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email' | 'phone'>('email');
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Get last login info
    const lastLoginInfo = localStorage.getItem('lastLogin');
    if (lastLoginInfo) {
      setLastLogin(lastLoginInfo);
    }
  }, [isAuthenticated, navigate]);
  
  // Check for remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      form.setValue('email', rememberedEmail);
      form.setValue('rememberMe', true);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoggingIn(true);
      
      // Remember email if rememberMe is checked
      if (values.rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Regular login flow
      await login(values.email, values.password);
      
      // Record last login time
      localStorage.setItem('lastLogin', new Date().toLocaleString());
      
      toast.success("Login successful!");
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Login failed. Please check your credentials.";
      
      // Enhanced error handling
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('Invalid email or password')) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes('too many attempts')) {
          errorMessage = "Too many failed login attempts. Please try again later.";
        } else if (error.message.toLowerCase().includes('network')) {
          errorMessage = "Network error. Please check your internet connection.";
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoggingIn(true);
      await socialLogin(provider);
      
      // Record last login time
      localStorage.setItem('lastLogin', new Date().toLocaleString());
      
      toast.success(`${provider} login successful!`);
      navigate('/');
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`${provider} login failed. Please try again.`);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsResetting(true);
      
      // For demo purposes, we'll just simulate sending a reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Password reset link sent! Check your email inbox.", {
        description: `Instructions have been sent to ${resetEmail}`
      });
      setShowResetPasswordDialog(false);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            Login
            {lastLogin && (
              <Badge variant="outline" className="text-xs font-normal">
                Last login: {lastLogin}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'phone'>('email' | 'phone'))}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input 
                              placeholder="your.email@example.com" 
                              {...field} 
                              className="pl-10"
                              autoComplete="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                              className="pl-10 pr-10"
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Remember me</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : 'Login'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="phone">
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Phone Number</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      className="pl-10"
                      disabled
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Phone login coming soon in a future update.
                  </p>
                </div>
                <Button disabled className="w-full">
                  Continue with Phone
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => handleSocialLogin('Google')}
              className={cn("w-full", isLoggingIn && "opacity-50 cursor-not-allowed")}
              disabled={isLoggingIn}
            >
              <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className={cn("w-full", isLoggingIn && "opacity-50 cursor-not-allowed")}
              disabled={isLoggingIn}
            >
              <Facebook className="mr-2 h-4 w-4 text-blue-600" />
              Facebook
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full text-sm">
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal" 
              onClick={() => setShowResetPasswordDialog(true)}
            >
              Forgot Password?
            </Button>
            <div>
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:text-primary/90 underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Password Reset Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input 
                  id="reset-email"
                  placeholder="your.email@example.com" 
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowResetPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordReset}
                disabled={isResetting || !resetEmail}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : 'Send Reset Link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
