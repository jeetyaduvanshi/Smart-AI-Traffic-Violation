import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Download, Share2, Upload, Eye, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Detection {
  type: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface ResultsPageProps {
  data: {
    file: File;
    preview: string;
    detections: Detection[];
    processedAt: string;
    annotatedImageUrl?: string;
  };
  onNavigate: (page: string) => void;
}

export function ResultsPage({ data, onNavigate }: ResultsPageProps) {
  const [showBboxes, setShowBboxes] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { file, preview, detections, processedAt, annotatedImageUrl } = data;

  const violationDetections = detections.filter(d => 
    d.type !== 'No Violations Detected'
  );

  const hasViolations = violationDetections.length > 0;

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!showBboxes || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes
    violationDetections.forEach((detection, index) => {
      if (!detection.bbox) return;

      const { x, y, width, height } = detection.bbox;
      
      // Set styles based on violation type
      const isHelmet = detection.type.includes('Helmet');
      const strokeColor = isHelmet ? '#ef4444' : '#f59e0b'; // red for helmet, yellow for triple riding
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      
      // Draw rectangle
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      const labelText = `${detection.type} (${(detection.confidence * 100).toFixed(1)}%)`;
      ctx.font = '16px Inter, system-ui, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const labelWidth = textMetrics.width + 16;
      const labelHeight = 24;
      
      ctx.fillStyle = strokeColor;
      ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(labelText, x + 8, y - 6);
    });
  }, [showBboxes, violationDetections]);

  const getViolationIcon = (type: string) => {
    if (type.includes('Helmet')) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (type.includes('Triple')) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getViolationColor = (type: string) => {
    if (type.includes('Helmet')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (type.includes('Triple')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = preview;
    link.download = `results_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Detection Results</h1>
            <p className="text-muted-foreground">
              Analysis completed on {new Date(processedAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Detections</p>
                  <p className="text-2xl font-bold">{detections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${hasViolations ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                  <AlertTriangle className={`h-5 w-5 ${hasViolations ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Violations Found</p>
                  <p className="text-2xl font-bold">{violationDetections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                  <p className="text-2xl font-bold">
                    {detections.length > 0 
                      ? Math.round(detections.reduce((acc, d) => acc + d.confidence, 0) / detections.length * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Image/Video Display */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{file.name}</CardTitle>
                  {isImage && violationDetections.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBboxes(!showBboxes)}
                    >
                      {showBboxes ? 'Hide' : 'Show'} Detections
                    </Button>
                  )}
                </div>
                <CardDescription>
                  {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {annotatedImageUrl && isImage ? (
                    <img
                      src={annotatedImageUrl}
                      alt="Annotated result"
                      className="w-full h-auto rounded-lg border"
                    />
                  ) : isImage ? (
                    <>
                      <img
                        ref={imageRef}
                        src={preview}
                        alt="Uploaded content"
                        className="w-full h-auto rounded-lg border"
                        onLoad={() => {
                          // Trigger canvas redraw after image loads
                          if (showBboxes) {
                            const event = new Event('resize');
                            window.dispatchEvent(event);
                          }
                        }}
                      />
                      {showBboxes && violationDetections.length > 0 && (
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-auto rounded-lg pointer-events-none"
                          style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
                        />
                      )}
                    </>
                  ) : isVideo && annotatedImageUrl ? (
                    <video
                      src={annotatedImageUrl}
                      controls
                      className="w-full h-auto rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Video preview not available</p>
                        <p className="text-sm text-muted-foreground">Detection results shown in panel →</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detection Results */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {hasViolations ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span>Detection Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detections.map((detection, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getViolationIcon(detection.type)}
                        <span className="font-medium">{detection.type}</span>
                      </div>
                      <Badge className={getViolationColor(detection.type)}>
                        {(detection.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    {detection.bbox && (
                      <div className="text-sm text-muted-foreground pl-7">
                        Location: ({Math.round(detection.bbox.x)}, {Math.round(detection.bbox.y)}) 
                        Size: {Math.round(detection.bbox.width)}×{Math.round(detection.bbox.height)}
                      </div>
                    )}
                    
                    {index < detections.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 hover:from-red-600 hover:via-yellow-600 hover:to-green-600 text-white border-0"
                onClick={() => onNavigate('upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Another File
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => onNavigate('history')}>
                View All Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
