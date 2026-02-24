'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Users, Send, CheckCircle2, XCircle, Clock, 
  Search, Filter, Download, Plus, Eye, Edit, Trash2,
  BarChart3, TrendingUp, Phone, MapPin, Building2,
  FileText, RefreshCw, Upload
} from 'lucide-react';

type Contact = {
  id: string;
  organizationType: string;
  organizationName: string;
  airportIcao?: string;
  city?: string;
  state?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  sourceType: string;
  createdAt: string;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  emailsSent: number;
  emailsOpened: number;
  responses: number;
  interested: number;
  createdAt: string;
};

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterState, setFilterState] = useState('');

  // Fetch contacts
  useEffect(() => {
    fetchContacts();
    fetchCampaigns();
  }, [filterType, filterState]);

  async function fetchContacts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (filterState) params.set('state', filterState);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/outreach/contacts?${params}`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/admin/outreach/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  }

  const stats = {
    totalContacts: contacts.length,
    totalEmails: campaigns.reduce((sum, c) => sum + c.emailsSent, 0),
    totalResponses: campaigns.reduce((sum, c) => sum + c.responses, 0),
    totalInterested: campaigns.reduce((sum, c) => sum + c.interested, 0),
  };

  const responseRate = stats.totalEmails > 0 
    ? ((stats.totalResponses / stats.totalEmails) * 100).toFixed(1)
    : '0';

  const interestRate = stats.totalResponses > 0
    ? ((stats.totalInterested / stats.totalResponses) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Outreach Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage contacts, campaigns, and track outreach performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Airports, clubs, schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalResponses} responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interestRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInterested} interested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="scrape">Scraping Tools</TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Database</CardTitle>
                  <CardDescription>
                    Scraped contacts from airports, flight clubs, and schools
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="airport">Airports</option>
                  <option value="flight_club">Flight Clubs</option>
                  <option value="flight_school">Flight Schools</option>
                  <option value="fbo">FBOs</option>
                </select>
                <Input
                  placeholder="State (e.g., MI)"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value.toUpperCase())}
                  className="w-24"
                />
                <Button onClick={fetchContacts}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Contacts Table */}
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-xs font-medium">Organization</th>
                      <th className="p-3 text-left text-xs font-medium">Type</th>
                      <th className="p-3 text-left text-xs font-medium">Contact</th>
                      <th className="p-3 text-left text-xs font-medium">Email</th>
                      <th className="p-3 text-left text-xs font-medium">Phone</th>
                      <th className="p-3 text-left text-xs font-medium">Location</th>
                      <th className="p-3 text-left text-xs font-medium">Source</th>
                      <th className="p-3 text-right text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                          Loading contacts...
                        </td>
                      </tr>
                    ) : contacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                          No contacts found. Run the scraper to collect data.
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact.id} className="border-b">
                          <td className="p-3 text-sm">
                            <div className="font-medium">{contact.organizationName}</div>
                            {contact.airportIcao && (
                              <div className="text-xs text-muted-foreground">{contact.airportIcao}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {contact.organizationType.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            {contact.contactName && (
                              <div className="font-medium">{contact.contactName}</div>
                            )}
                            {contact.contactTitle && (
                              <div className="text-xs text-muted-foreground">{contact.contactTitle}</div>
                            )}
                          </td>
                          <td className="p-3 text-sm">
                            {contact.contactEmail && (
                              <a href={`mailto:${contact.contactEmail}`} className="text-primary hover:underline">
                                {contact.contactEmail}
                              </a>
                            )}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {contact.contactPhone || '—'}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {contact.city && contact.state ? `${contact.city}, ${contact.state}` : '—'}
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs">
                              {contact.sourceType}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Campaigns</CardTitle>
                  <CardDescription>
                    Create and manage outreach campaigns
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="rounded-md border border-dashed p-8 text-center">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-sm font-semibold">No campaigns yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create your first outreach campaign to start sending emails
                    </p>
                    <Button className="mt-4" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <Badge variant={
                                campaign.status === 'active' ? 'default' :
                                campaign.status === 'completed' ? 'secondary' :
                                'outline'
                              }>
                                {campaign.status}
                              </Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Sent</div>
                                <div className="font-medium">{campaign.emailsSent}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Opened</div>
                                <div className="font-medium">{campaign.emailsOpened}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Responded</div>
                                <div className="font-medium">{campaign.responses}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Interested</div>
                                <div className="font-medium text-chart-2">{campaign.interested}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scraping Tools Tab */}
        <TabsContent value="scrape" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Tools</CardTitle>
              <CardDescription>
                Run scrapers to collect contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Airport & FBO Contacts</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Scrape AirNav.com for airport managers and FBO contacts
                        </p>
                        <Button className="mt-3" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Run Scraper
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Users className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Flight Club Contacts</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Scrape EAA chapters and AOPA club directories
                        </p>
                        <Button className="mt-3" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Run Scraper
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-dashed">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-sm font-semibold">Manual Import</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload a CSV file with contact information
                    </p>
                    <Button className="mt-4" size="sm" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
