import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error);
    } else {
      onNavigate('home');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-yellow-500/5 to-green-500/5"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your TrafficAI account to continue monitoring traffic violations.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-primary"
                onClick={() => onNavigate('signup')}
              >
                Create one here
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-primary"
                onClick={() => onNavigate('landing')}
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
