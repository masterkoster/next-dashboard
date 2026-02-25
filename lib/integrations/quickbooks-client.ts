/**
 * QuickBooks API Client
 * Handles OAuth, token management, and API requests to QuickBooks Online
 */

import { prisma } from '@/lib/prisma'

// QuickBooks OAuth endpoints
const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2'
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
const QB_REVOKE_URL = 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke'
const QB_API_BASE = process.env.QUICKBOOKS_ENVIRONMENT === 'production'
  ? 'https://quickbooks.api.intuit.com'
  : 'https://sandbox-quickbooks.api.intuit.com'

interface QuickBooksConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  environment: 'sandbox' | 'production'
}

export class QuickBooksClient {
  private config: QuickBooksConfig
  private integrationId?: string

  constructor(config?: Partial<QuickBooksConfig>, integrationId?: string) {
    this.config = {
      clientId: config?.clientId || process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: config?.clientSecret || process.env.QUICKBOOKS_CLIENT_SECRET || '',
      redirectUri: config?.redirectUri || process.env.QUICKBOOKS_REDIRECT_URI || '',
      environment: (config?.environment || process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    }
    this.integrationId = integrationId
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string, groupId: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'com.intuit.quickbooks.accounting',
      state: `${groupId}:${state}`, // Encode groupId in state
    })

    return `${QB_AUTH_URL}?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
    realmId: string
  }> {
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')

    const response = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`QuickBooks OAuth error: ${error}`)
    }

    const data = await response.json()
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      realmId: data.realm_id || '',
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> {
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')

    const response = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`QuickBooks token refresh error: ${error}`)
    }

    const data = await response.json()
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  }

  /**
   * Revoke OAuth tokens (disconnect)
   */
  async revokeToken(token: string): Promise<void> {
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')

    const response = await fetch(QB_REVOKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        token: token,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`QuickBooks revoke error: ${error}`)
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(integrationId: string): Promise<string> {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    })

    if (!integration || integration.provider !== 'quickbooks') {
      throw new Error('QuickBooks integration not found')
    }

    if (!integration.accessToken || !integration.refreshToken) {
      throw new Error('No OAuth tokens found')
    }

    // Check if token is expired (refresh 5 minutes before expiry)
    const now = new Date()
    const expiryBuffer = new Date(integration.tokenExpiry || 0)
    expiryBuffer.setMinutes(expiryBuffer.getMinutes() - 5)

    if (now >= expiryBuffer) {
      // Token expired or about to expire, refresh it
      const { accessToken, refreshToken, expiresIn } = await this.refreshAccessToken(integration.refreshToken)
      
      // Update database
      const tokenExpiry = new Date()
      tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn)

      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          accessToken,
          refreshToken,
          tokenExpiry,
          updatedAt: new Date(),
        },
      })

      return accessToken
    }

    return integration.accessToken
  }

  /**
   * Make authenticated API request to QuickBooks
   */
  async makeRequest(
    endpoint: string,
    options: RequestInit & { realmId?: string } = {}
  ): Promise<any> {
    if (!this.integrationId) {
      throw new Error('Integration ID required for API requests')
    }

    const integration = await prisma.integration.findUnique({
      where: { id: this.integrationId },
    })

    if (!integration) {
      throw new Error('Integration not found')
    }

    const accessToken = await this.getValidAccessToken(this.integrationId)
    const realmId = options.realmId || integration.realmId

    if (!realmId) {
      throw new Error('QuickBooks Company ID (realmId) not found')
    }

    const url = `${QB_API_BASE}/v3/company/${realmId}/${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`QuickBooks API error: ${error}`)
    }

    return response.json()
  }

  // ────────────────────────────────────────────────────────────────────────
  // API Methods - Customers
  // ────────────────────────────────────────────────────────────────────────

  async getCustomers(realmId?: string): Promise<any[]> {
    const data = await this.makeRequest('query?query=SELECT * FROM Customer', {
      method: 'GET',
      realmId,
    })
    return data.QueryResponse?.Customer || []
  }

  async createCustomer(customer: any, realmId?: string): Promise<any> {
    const data = await this.makeRequest('customer', {
      method: 'POST',
      body: JSON.stringify(customer),
      realmId,
    })
    return data.Customer
  }

  // ────────────────────────────────────────────────────────────────────────
  // API Methods - Items (Products/Services)
  // ────────────────────────────────────────────────────────────────────────

  async getItems(realmId?: string): Promise<any[]> {
    const data = await this.makeRequest('query?query=SELECT * FROM Item', {
      method: 'GET',
      realmId,
    })
    return data.QueryResponse?.Item || []
  }

  async createItem(item: any, realmId?: string): Promise<any> {
    const data = await this.makeRequest('item', {
      method: 'POST',
      body: JSON.stringify(item),
      realmId,
    })
    return data.Item
  }

  // ────────────────────────────────────────────────────────────────────────
  // API Methods - Invoices
  // ────────────────────────────────────────────────────────────────────────

  async getInvoices(realmId?: string): Promise<any[]> {
    const data = await this.makeRequest('query?query=SELECT * FROM Invoice', {
      method: 'GET',
      realmId,
    })
    return data.QueryResponse?.Invoice || []
  }

  async createInvoice(invoice: any, realmId?: string): Promise<any> {
    const data = await this.makeRequest('invoice', {
      method: 'POST',
      body: JSON.stringify(invoice),
      realmId,
    })
    return data.Invoice
  }

  // ────────────────────────────────────────────────────────────────────────
  // API Methods - Payments
  // ────────────────────────────────────────────────────────────────────────

  async createPayment(payment: any, realmId?: string): Promise<any> {
    const data = await this.makeRequest('payment', {
      method: 'POST',
      body: JSON.stringify(payment),
      realmId,
    })
    return data.Payment
  }

  // ────────────────────────────────────────────────────────────────────────
  // API Methods - Company Info
  // ────────────────────────────────────────────────────────────────────────

  async getCompanyInfo(realmId?: string): Promise<any> {
    const data = await this.makeRequest('companyinfo/' + (realmId || ''), {
      method: 'GET',
      realmId,
    })
    return data.CompanyInfo
  }
}

// Export singleton instance
export const quickbooksClient = new QuickBooksClient()
