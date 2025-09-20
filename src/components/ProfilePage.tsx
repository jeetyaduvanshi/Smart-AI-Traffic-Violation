import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthContext';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await updateProfile(name);

    if (error) {
      setError(error);
    } else {
      setSuccess('Profile updated successfully!');
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your profile
            </p>
            <Button onClick={() => onNavigate('login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <User className="h-8 w-8" />
            <span>Profile Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and personal information
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center space-y-4 rounded-[0px]">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarFallback className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white text-xl">
                  {user.user_metadata?.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-xl font-semibold">
                  {user.user_metadata?.name || 'User'}
                </h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Account Verified</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed after account creation
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>
                  Overview of your detection activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Files Processed</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Violations Found</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">0%</div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Days Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Download Your Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Export all your detection history and account data
                    </p>
                  </div>
                  <Button variant="outline">
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Clear Detection History</h4>
                    <p className="text-sm text-muted-foreground">
                      Remove all your uploaded files and detection results
                    </p>
                  </div>
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Clear History
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}