'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  totalWithdrawn: number;
  recentUsers: any[];
  recentWithdrawals: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-400 text-center py-8">Failed to load dashboard stats</p>;
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Earnings', value: `PKR ${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Total Withdrawn', value: `PKR ${stats.totalWithdrawn.toLocaleString()}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{card.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold">PKR {user.balance}</p>
                    <p className="text-gray-600 text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {stats.recentUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentWithdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="text-white font-medium">{w.user?.name}</p>
                    <p className="text-gray-500 text-sm">{w.jazzCashNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">PKR {w.amount}</p>
                    <Badge
                      variant={w.status === 'APPROVED' ? 'default' : w.status === 'REJECTED' ? 'destructive' : 'secondary'}
                      className={w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                    >
                      {w.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentWithdrawals.length === 0 && (
                <p className="text-gray-500 text-center py-4">No withdrawals yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
