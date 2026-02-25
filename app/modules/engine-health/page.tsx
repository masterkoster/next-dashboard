'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Plane,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  X,
  UploadCloud,
  AlertCircle,
  Info
} from 'lucide-react'

interface Anomaly {
  id: string
  aircraftId: string
  type: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  value: number
  threshold: number
  message: string
  flightDate: string
  acknowledged: boolean
  createdAt: string
}

interface UploadRecord {
  id: string
  aircraftId: string
  fileName: string
  fileType: string
  uploadDate: string
}

export default function EngineHealthPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedAircraft, setSelectedAircraft] = useState('')
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [counts, setCounts] = useState({ critical: 0, warning: 0, info: 0 })
  const [uploadResult, setUploadResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Demo aircraft - in real app would fetch from user's aircraft
  const aircraftList = [
    { id: '1', nNumber: 'N12345', nickname: 'Cessna 172' },
    { id: '2', nNumber: 'N54321', nickname: 'Piper Archer' },
  ]

  useEffect(() => {
    if (session) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchData = async () => {
    try {
      // Fetch anomalies
      const anomalyRes = await fetch('/api/engine/anomalies')
      if (anomalyRes.ok) {
        const anomalyData = await anomalyRes.json()
        setAnomalies(anomalyData.anomalies || [])
        setCounts(anomalyData.counts || { critical: 0, warning: 0, info: 0 })
      }

      // Fetch uploads
      const uploadRes = await fetch('/api/engine/upload')
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        setUploads(uploadData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedAircraft) {
      alert('Please select an aircraft first')
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('aircraftId', selectedAircraft)

      const res = await fetch('/api/engine/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      setUploadResult(result)

      if (result.success) {
        fetchData()
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult({ error: 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const acknowledgeAnomaly = async (anomalyId: string) => {
    try {
      await fetch('/api/engine/anomalies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyId, acknowledge: true }),
      })
      fetchData()
    } catch (error) {
      console.error('Error acknowledging:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500'
      case 'WARNING': return 'bg-amber-500'
      default: return 'bg-blue-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'WARNING': return <AlertCircle className="h-4 w-4 text-amber-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Engine Health Monitoring</h2>
            <p className="text-muted-foreground mb-4">
              Sign in to upload engine monitor data and track engine health
            </p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Engine Health Monitoring
            </h1>
            <p className="text-muted-foreground">
              Upload engine monitor data to detect anomalies and track engine health
            </p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Flights</p>
                  <p className="text-2xl font-bold">{uploads.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{counts.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-500/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-amber-500">{counts.warning}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Info</p>
                  <p className="text-2xl font-bold text-blue-500">{counts.info}</p>
                </div>
                <Info className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies ({anomalies.length})</TabsTrigger>
            <TabsTrigger value="uploads">Upload History</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  Upload Engine Data
                </CardTitle>
                <CardDescription>
                  Upload engine monitor data from JPI, Garmin G1000, or CSV files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="aircraft">Select Aircraft</Label>
                    <select
                      id="aircraft"
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                      value={selectedAircraft}
                      onChange={(e) => setSelectedAircraft(e.target.value)}
                    >
                      <option value="">Choose aircraft...</option>
                      {aircraftList.map((ac) => (
                        <option key={ac.id} value={ac.id}>
                          {ac.nNumber} - {ac.nickname}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label>Upload File</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt,.dat"
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                      onChange={handleFileUpload}
                      disabled={uploading || !selectedAircraft}
                    />
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing uploaded data...
                  </div>
                )}

                {uploadResult && (
                  <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
                    {uploadResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                    </AlertTitle>
                    <AlertDescription>
                      {uploadResult.success ? (
                        <>
                          Processed {uploadResult.flightsProcessed} flights. Found {uploadResult.anomaliesFound} anomalies.
                        </>
                      ) : (
                        uploadResult.error
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Supported formats:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>JPI EDM (.csv, .txt, .dat)</li>
                    <li>Garmin G1000 CSV exports</li>
                    <li>Generic CSV with columns: Date, CHT, EGT, Fuel Flow, Oil Temp, Oil Pressure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-4">
            {anomalies.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium">No Anomalies Detected</h3>
                  <p className="text-muted-foreground">
                    Your engine data looks healthy. Upload more data to continue monitoring.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <Card key={anomaly.id} className={`
                    ${anomaly.severity === 'CRITICAL' ? 'border-red-500/50' : ''}
                    ${anomaly.severity === 'WARNING' ? 'border-amber-500/50' : ''}
                  `}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(anomaly.severity)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{anomaly.type.replace(/_/g, ' ')}</span>
                              <Badge className={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {anomaly.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Value: {anomaly.value.toFixed(1)} | Threshold: {anomaly.threshold}
                            </p>
                          </div>
                        </div>
                        
                        {!anomaly.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => acknowledgeAnomaly(anomaly.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Uploads Tab */}
          <TabsContent value="uploads" className="space-y-4">
            {uploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Uploads Yet</h3>
                  <p className="text-muted-foreground">
                    Upload your first engine monitor data file to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {uploads.map((upload) => (
                      <div 
                        key={upload.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{upload.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {upload.fileType} • {new Date(upload.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{upload.fileType}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
