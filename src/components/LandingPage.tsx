import React from 'react';
import { Shield, Eye, AlertTriangle, Zap, CheckCircle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Shield,
      title: 'Helmet Detection',
      description: 'Advanced AI algorithms detect whether riders are wearing helmets for safety compliance.',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Triple Riding Detection',
      description: 'Identify vehicles carrying more than the legal limit of passengers to prevent accidents.',
      color: 'text-yellow-500'
    },
    {
      icon: Eye,
      title: 'Real-time Analysis',
      description: 'Process images and videos instantly with our cutting-edge computer vision technology.',
      color: 'text-blue-500'
    },
    {
      icon: Zap,
      title: 'High Accuracy',
      description: 'Achieve 95%+ accuracy in violation detection with our trained neural networks.',
      color: 'text-purple-500'
    }
  ];

  const stats = [
    { label: 'Violations Detected', value: '50,000+' },
    { label: 'Accuracy Rate', value: '96.5%' },
    { label: 'Processing Speed', value: '<2s' },
    { label: 'User Satisfaction', value: '98%' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-green-500/10"></div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-green-500 text-white px-4 py-2 rounded-full">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">AI-Powered Safety</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
                  Smart Traffic Violation Detection
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg">
                  Revolutionize road safety with our advanced AI system that detects helmet violations and triple riding incidents in real-time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
                >
                  Get Started
                  <Shield className="ml-2 h-5 w-5" />
                </Button>
                
                <Button size="lg" variant="outline">
                  Watch Demo
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1590560711594-85381f33d036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwbW9uaXRvcmluZyUyMHNtYXJ0JTIwY2l0eSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4MTM1NTUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Smart traffic monitoring system"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-card border rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">96.5% Accuracy</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card border rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Real-time Detection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Detection Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system provides comprehensive traffic safety monitoring with industry-leading accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex p-3 rounded-full bg-background ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-green-500/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Enhance Road Safety?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of traffic authorities using our AI-powered detection system to make roads safer for everyone.
            </p>
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
            >
              Start Detecting Violations
              <Shield className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}