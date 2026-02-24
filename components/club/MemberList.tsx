'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, UserPlus, Search } from 'lucide-react';

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MemberListProps {
  groupId: string;
  isAdmin?: boolean;
}

export default function MemberList({ groupId, isAdmin = false }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (res.ok) {
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member from the club?')) return;

    try {
      const res = await fetch(`/api/groups/${groupId}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const filteredMembers = members.filter(m => 
    m.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'CFI':
        return <Badge className="bg-blue-100 text-blue-800">CFI</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading members...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members ({members.length})</CardTitle>
          {isAdmin && (
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {member.user.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{member.user.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getRoleBadge(member.role)}
                
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-background"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="CFI">CFI</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No members found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
