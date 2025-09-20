import React, { useState, useEffect } from 'react';
import { History, AlertTriangle, CheckCircle, Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';

interface HistoryEntry {
  userId: string;
  filename: string;
  fileType: string;
  detections: Array<{
    type: string;
    confidence: number;
    bbox?: any;
  }>;
  timestamp: string;
  processed: boolean;
}

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const { getSupabaseClient } = await import('../utils/supabase/client');
      const { projectId } = await import('../utils/supabase/info');
      
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to view history');
        return;
      }

      console.log('Fetching history from:', `https://${projectId}.supabase.co/functions/v1/make-server-10238d4d/history`);
      console.log('Authorization token:', session.access_token?.substring(0, 20) + '...');

      let serverHistory = [];
      let useLocalStorage = false;

      try {
        // Try the main endpoint first
        let response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10238d4d/history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // If the main endpoint fails, try alternative endpoints
        if (!response.ok) {
          console.log('Main endpoint failed, trying alternative...');
          
          // Try without the make-server prefix
          response = await fetch(`https://${projectId}.supabase.co/functions/v1/history`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Alternative response status:', response.status);
        }
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || data.message || `HTTP ${response.status}: Server not available`);
        }

        serverHistory = data.history || [];
        console.log('Server history loaded:', serverHistory.length, 'entries');
      } catch (serverError) {
        console.log('Server not available, falling back to localStorage:', serverError);
        useLocalStorage = true;
      }

      // If server is not available, try localStorage
      if (useLocalStorage || serverHistory.length === 0) {
        console.log('Loading from localStorage...');
        let localHistory = [];
        try {
          localHistory = JSON.parse(localStorage.getItem('trafficViolationHistory') || '[]');
        } catch (parseError) {
          console.error('Failed to parse localStorage history:', parseError);
          localHistory = [];
        }
        
        // Filter history for current user
        const userHistory = localHistory.filter((entry: any) => entry.userId === session.user.id);
        
        console.log('Local history loaded:', userHistory.length, 'entries');
        
        // Combine server and local history, removing duplicates
        const combinedHistory = [...serverHistory];
        
        userHistory.forEach((localEntry: any) => {
          // Check if this entry already exists in server history
          const exists = serverHistory.some((serverEntry: any) => 
            serverEntry.filename === localEntry.filename && 
            serverEntry.timestamp === localEntry.timestamp
          );
          
          if (!exists) {
            combinedHistory.push(localEntry);
          }
        });
        
        // Sort by timestamp descending
        combinedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setHistory(combinedHistory);
        
        if (useLocalStorage && combinedHistory.length > 0) {
          setError('Using local storage - server not available. Some features may be limited.');
        }
      } else {
        setHistory(serverHistory);
      }
    } catch (err) {
      console.error('History fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const hasViolations = entry.detections.some(d => d.type !== 'No Violations Detected');
    if (filterType === 'violations') return matchesSearch && hasViolations;
    if (filterType === 'clean') return matchesSearch && !hasViolations;
    if (filterType === 'helmet') return matchesSearch && entry.detections.some(d => d.type.includes('Helmet'));
    if (filterType === 'triple') return matchesSearch && entry.detections.some(d => d.type.includes('Triple'));
    
    return matchesSearch;
  });

  const getStatusBadge = (detections: any[]) => {
    const violations = detections.filter(d => d.type !== 'No Violations Detected');
    
    if (violations.length === 0) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">No Violations</Badge>;
    }
    
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{violations.length} Violation{violations.length > 1 ? 's' : ''}</Badge>;
  };

  const getViolationTypes = (detections: any[]) => {
    const violations = detections.filter(d => d.type !== 'No Violations Detected');
    return violations.map(v => v.type).join(', ') || 'None';
  };

  const stats = {
    total: history.length,
    violations: history.filter(h => h.detections.some(d => d.type !== 'No Violations Detected')).length,
    clean: history.filter(h => !h.detections.some(d => d.type !== 'No Violations Detected')).length,
    helmet: history.filter(h => h.detections.some(d => d.type.includes('Helmet'))).length,
    triple: history.filter(h => h.detections.some(d => d.type.includes('Triple'))).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <History className="h-8 w-8" />
              <span>Detection History</span>
            </h1>
            <p className="text-muted-foreground">
              View and manage your past traffic violation detections
            </p>
          </div>
          
          <Button onClick={() => onNavigate('upload')} className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0">
            New Detection
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.violations}</div>
              <div className="text-sm text-muted-foreground">With Violations</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.clean}</div>
              <div className="text-sm text-muted-foreground">Clean Files</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.helmet}</div>
              <div className="text-sm text-muted-foreground">Helmet Issues</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.triple}</div>
              <div className="text-sm text-muted-foreground">Triple Riding</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="violations">With Violations</SelectItem>
                  <SelectItem value="clean">Clean Files</SelectItem>
                  <SelectItem value="helmet">Helmet Issues</SelectItem>
                  <SelectItem value="triple">Triple Riding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant={error.includes('local storage') ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchHistory}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
              <CardDescription>
                Showing {filteredHistory.length} of {history.length} files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((entry, index) => {
                      const isImage = entry.fileType.startsWith('image/');
                      const violations = entry.detections.filter(d => d.type !== 'No Violations Detected');
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isImage ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
                                <Eye className={`h-5 w-5 ${isImage ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium truncate max-w-xs">{entry.filename}</p>
                                  {entry.localStorage && (
                                    <Badge variant="outline" className="text-xs">
                                      Local
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{entry.fileType}</p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline">
                              {isImage ? 'Image' : 'Video'}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            {getStatusBadge(entry.detections)}
                          </TableCell>
                          
                          <TableCell>
                            <div className="max-w-xs">
                              {violations.length > 0 ? (
                                <div className="space-y-1">
                                  {violations.map((violation, idx) => (
                                    <div key={idx} className="text-sm">
                                      {violation.type} ({(violation.confidence * 100).toFixed(1)}%)
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">None detected</span>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {new Date(entry.timestamp).toLocaleDateString()}
                              <div className="text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Detection History</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'No files match your current filters'
                  : 'Start by uploading your first file for violation detection'
                }
              </p>
              {(!searchTerm && filterType === 'all') && (
                <Button onClick={() => onNavigate('upload')} className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0">
                  Upload First File
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}