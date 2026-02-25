import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { detectFileType, parseCSV, validateEngineData } from '@/lib/engine/parser'
import { detectAnomalies, DEFAULT_THRESHOLDS } from '@/lib/engine/anomaly-detection'

// POST /api/engine/upload
// Upload engine monitoring data
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const aircraftId = formData.get('aircraftId') as string | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!aircraftId) {
      return NextResponse.json({ error: 'aircraftId is required' }, { status: 400 })
    }
    
    // Read file content
    const content = await file.text()
    
    // Detect file type
    const fileType = detectFileType(content, file.name)
    
    // Parse based on type
    let parsedData
    try {
      parsedData = parseCSV(content)
    } catch (error) {
      console.error('Parse error:', error)
      return NextResponse.json({ error: 'Failed to parse file' }, { status: 400 })
    }
    
    // Validate data
    const { valid, errors } = validateEngineData(parsedData)
    
    if (valid.length === 0) {
      return NextResponse.json({ 
        error: 'No valid data found in file',
        details: errors 
      }, { status: 400 })
    }
    
    // Create upload record
    const upload = await prisma.engineDataUpload.create({
      data: {
        aircraftId,
        userId: session.user.id,
        fileName: file.name,
        fileType,
        data: JSON.stringify(valid),
      }
    })
    
    // Detect anomalies for each flight
    const allAnomalies: any[] = []
    
    for (const flightData of valid) {
      const anomalies = detectAnomalies(flightData, DEFAULT_THRESHOLDS)
      
      for (const anomaly of anomalies) {
        const createdAnomaly = await prisma.engineAnomaly.create({
          data: {
            aircraftId,
            userId: session.user.id,
            uploadId: upload.id,
            flightDate: flightData.flightDate,
            type: anomaly.type,
            severity: anomaly.severity,
            value: anomaly.value,
            threshold: anomaly.threshold,
            message: anomaly.message,
          }
        })
        allAnomalies.push(createdAnomaly)
      }
    }
    
    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      flightsProcessed: valid.length,
      anomaliesFound: allAnomalies.length,
      anomalies: allAnomalies.slice(0, 10), // Return first 10
      errors: errors.slice(0, 5), // Return first 5 errors
    })
    
  } catch (error) {
    console.error('Engine upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET /api/engine/upload
// Get user's engine uploads
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const aircraftId = searchParams.get('aircraftId')
    
    const where: any = {
      userId: session.user.id,
    }
    
    if (aircraftId) {
      where.aircraftId = aircraftId
    }
    
    const uploads = await prisma.engineDataUpload.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
      take: 20,
    })
    
    return NextResponse.json(uploads)
  } catch (error) {
    console.error('Error fetching uploads:', error)
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 })
  }
}
