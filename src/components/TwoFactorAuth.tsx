
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { generateVerificationCode, sendVerificationEmail, verifyCode } from '@/utils/twoFactorAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface TwoFactorAuthProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export const TwoFactorAuth = ({ onVerificationComplete, onCancel }: TwoFactorAuthProps) => {
  const { currentUser } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Generate and send verification code when component mounts
    sendNewCode();
    
    // Start countdown timer
    return () => {
      // Cleanup
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const sendNewCode = async () => {
    if (!currentUser?.email) return;
    
    setIsSending(true);
    const code = generateVerificationCode();
    setExpectedCode(code);
    setTimeLeft(300); // 5 minutes expiry
    
    try {
      const sent = await sendVerificationEmail(currentUser.email, code);
      if (sent) {
        toast.success("Verification code sent", {
          description: `Check your email at ${currentUser.email}`
        });
      } else {
        toast.error("Failed to send verification code");
      }
    } catch (error) {
      toast.error("Error sending verification code");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error("Please enter verification code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify the code
      if (verifyCode(verificationCode, expectedCode)) {
        toast.success("Verification successful");
        onVerificationComplete();
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error) {
      toast.error("Verification failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input 
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          
          {timeLeft > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Code expires in {formatTime(timeLeft)}
            </div>
          )}
          {timeLeft === 0 && (
            <div className="text-center text-sm text-destructive">
              Code expired. Please request a new code.
            </div>
          )}
        </div>
        
        <div className="text-center">
          <Button
            variant="link"
            size="sm"
            disabled={isSending || timeLeft > 270} // Prevent resend within 30 seconds
            onClick={sendNewCode}
            className="text-xs"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                {timeLeft > 270 
                  ? `Resend code in ${formatTime(timeLeft - 270)}`
                  : "Didn't receive the code? Send again"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
