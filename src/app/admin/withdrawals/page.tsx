'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = () => {
    setLoading(true);
    const status = statusFilter === 'ALL' ? '' : statusFilter;
    fetch(`/api/admin/withdrawals?page=${page}&limit=15&status=${status}`)
      .then(r => r.json())
      .then(data => {
        setWithdrawals(data.withdrawals || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWithdrawals(); }, [page, statusFilter]);

  const updateWithdrawal = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchWithdrawals();
    } catch {}
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <Tabs value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="ALL" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">All</TabsTrigger>
          <TabsTrigger value="PENDING" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-400">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED" className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-400">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">User</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Amount</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">JazzCash</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Date</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
                ) : withdrawals.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No withdrawals found</td></tr>
                ) : withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4">
                      <p className="text-white font-medium">{w.user?.name}</p>
                      <p className="text-gray-500 text-sm">{w.user?.email}</p>
                    </td>
                    <td className="p-4 text-white font-semibold">PKR {w.amount}</td>
                    <td className="p-4 text-gray-400">{w.jazzCashNumber}</td>
                    <td className="p-4">
                      <Badge
                        variant={w.status === 'APPROVED' ? 'default' : w.status === 'REJECTED' ? 'destructive' : 'secondary'}
                        className={w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : w.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : ''}
                      >
                        {w.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {w.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            onClick={() => updateWithdrawal(w.id, 'APPROVED')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => updateWithdrawal(w.id, 'REJECTED')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-gray-700 text-gray-300">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-gray-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-gray-700 text-gray-300">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
