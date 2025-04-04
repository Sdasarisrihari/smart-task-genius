
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { Loader2, Copy, RefreshCw } from 'lucide-react';

export function BackupCodesGenerator() {
  const [codes, setCodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateBackupCodes = async () => {
    setIsGenerating(true);
    try {
      // In a real app, these would be generated on the server
      const newCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        // Generate a random 8-character alphanumeric code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        newCodes.push(code);
      }
      
      setCodes(newCodes);
      
      // Store codes in localStorage for demo purposes
      // In a real app, these would be stored securely on the server
      localStorage.setItem('backupCodes', JSON.stringify(newCodes));
      
      toast.success("Backup codes generated", {
        description: "Store these codes in a safe place."
      });
    } catch (error) {
      console.error("Error generating backup codes:", error);
      toast.error("Failed to generate backup codes");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!codes.length) return;
    
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText)
      .then(() => toast.success("Codes copied to clipboard"))
      .catch(err => {
        console.error("Failed to copy codes:", err);
        toast.error("Failed to copy codes to clipboard");
      });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Codes</CardTitle>
        <CardDescription>
          Generate backup codes for account recovery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {codes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Store these 10 backup codes in a safe place. Each code can be used once to log in if you lose access to your account.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {codes.map((code, index) => (
                <div key={index} className="relative flex items-center border rounded-md p-2 font-mono">
                  <span>{code}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center"
                size="sm"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy all codes
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No backup codes have been generated yet. Generate codes for emergency account access.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateBackupCodes} 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : codes.length > 0 ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate new codes
            </>
          ) : (
            'Generate backup codes'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
