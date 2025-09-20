import React from 'react';
import { Upload, History, Shield, TrendingUp, AlertTriangle, CheckCircle, Activity, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const quickActions = [
    {
      title: 'Upload File',
      description: 'Detect violations in images and videos',
      icon: Upload,
      action: 'upload',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View History',
      description: 'Review past detection results',
      icon: History,
      action: 'history',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    {
      title: 'Total Detections',
      value: '0',
      icon: Activity,
      description: 'Files processed',
      color: 'text-blue-600'
    },
    {
      title: 'Violations Found',
      value: '0',
      icon: AlertTriangle,
      description: 'Safety violations detected',
      color: 'text-red-600'
    },
    {
      title: 'Clean Files',
      value: '0',
      icon: CheckCircle,
      description: 'No violations detected',
      color: 'text-green-600'
    },
    {
      title: 'Detection Rate',
      value: '0%',
      icon: TrendingUp,
      description: 'Average accuracy',
      color: 'text-purple-600'
    }
  ];

  const recentDetections = [
    // Placeholder for when user has no history
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white px-6 py-3 rounded-full">
            <Shield className="h-6 w-6" />
            <span className="font-semibold">TrafficAI Dashboard</span>
          </div>
          
          <h1 className="text-4xl font-bold">
            Welcome to Smart Traffic Detection
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor road safety with AI-powered violation detection. Upload images or videos to identify helmet violations and triple riding incidents.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/30"
                onClick={() => onNavigate(action.action)}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${action.gradient} text-white`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{action.title}</h3>
                    <p className="text-muted-foreground">{action.description}</p>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.title}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Detections Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Detections</CardTitle>
              <CardDescription>
                Latest violation detection results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDetections.length > 0 ? (
                <div className="space-y-4">
                  {/* Will show actual detections when available */}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Detections Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first file to start detecting traffic violations
                  </p>
                  <Button 
                    onClick={() => onNavigate('upload')}
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
                  >
                    Upload File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detection Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Insights</CardTitle>
              <CardDescription>
                AI performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Helmet Detection</span>
                  <span className="text-sm font-medium">96.5%</span>
                </div>
                <Progress value={96.5} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Triple Riding Detection</span>
                  <span className="text-sm font-medium">94.2%</span>
                </div>
                <Progress value={94.2} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Overall Accuracy</span>
                  <span className="text-sm font-medium">95.8%</span>
                </div>
                <Progress value={95.8} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.1%</div>
                  <div className="text-sm text-muted-foreground">System Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Capabilities</CardTitle>
            <CardDescription>
              Advanced AI features for comprehensive traffic safety monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 w-16 h-16 mx-auto flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold">Helmet Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Identify riders without proper safety helmets with 96.5% accuracy
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 w-16 h-16 mx-auto flex items-center justify-center">
                  <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-semibold">Triple Riding Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Detect overcrowded vehicles exceeding passenger limits
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 w-16 h-16 mx-auto flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">Real-time Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Process images and videos instantly with sub-2 second response times
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}