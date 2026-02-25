import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { QuickBooksClient } from '@/lib/integrations/quickbooks-client'
import { randomBytes } from 'crypto'

/**
 * GET /api/integrations/quickbooks/connect
 * 
 * Initiates QuickBooks OAuth flow
 * Redirects user to QuickBooks authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get groupId from query params
    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'groupId required' }, { status: 400 })
    }

    // TODO: Verify user has admin access to this group
    // const group = await prisma.group.findFirst({
    //   where: { id: groupId, /* user is admin */ }
    // })

    // Generate random state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state in session/cookie for verification in callback
    // For now, we'll encode it in the URL - in production use session storage
    
    const client = new QuickBooksClient()
    const authUrl = client.getAuthorizationUrl(state, groupId)

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Redirect user to authUrl to complete authorization',
    })
  } catch (error) {
    console.error('QuickBooks connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate QuickBooks connection' },
      { status: 500 }
    )
  }
}
