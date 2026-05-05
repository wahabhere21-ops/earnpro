'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { useToast } from '@/hooks/use-toast'
import AnimatedCounter from './AnimatedCounter'
import {
  LogOut,
  LayoutDashboard,
  CreditCard,
  Users,
  Banknote,
  Star,
  Check,
  X,
  Loader2,
  TrendingUp,
  Wallet,
  UserCheck,
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  Shield,
  Clock,
  Settings,
} from 'lucide-react'

type AdminTab = 'overview' | 'payments' | 'users' | 'withdrawals' | 'reviews'

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  totalPaid: number
  adminProfit: number
  pendingSlips: number
  pendingWithdrawals: number
  recentUsers: any[]
  topReferrers: any[]
  pendingSlipList: any[]
  pendingWithdrawalList: any[]
}

interface ReviewItem {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

export default function AdminPanel() {
  const { user, token, setView, logout, setLoading: setStoreLoading, isLoading } = useStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewTotal, setReviewTotal] = useState(0)
  const [reviewPage, setReviewPage] = useState(1)
  const [adminNote, setAdminNote] = useState<Record<string, string>>({})
  const [newReview, setNewReview] = useState({ name: '', rating: '5', comment: '' })
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    if (!user?.id) return
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': user.id }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // silent
    }
  }

  const fetchUsers = async () => {
    if (!user?.id) return
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-user-id': user.id }
      })
      if (res.ok) {
        const data = await res.json()
        setAllUsers(data.users)
      }
    } catch {
      // silent
    }
  }

  const fetchReviews = async (page: number) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/reviews?page=${page}&limit=20`, {
        headers: { 'x-user-id': user.id }
      })
      if (res.ok) {
        const data = await res.json()
        if (page === 1) {
          setReviews(data.reviews)
        } else {
          setReviews(prev => [...prev, ...data.reviews])
        }
        setReviewTotal(data.total)
      }
    } catch {
      // silent
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchUsers(), fetchReviews(1)])
    setRefreshing(false)
    toast({ title: 'Refreshed!', description: 'Data updated' })
  }

  useEffect(() => {
    void fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    if (activeTab === 'users') void fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'reviews' && reviews.length === 0) void fetchReviews(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleVerifySlip = async (slipId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return
    setStoreLoading(true)
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          slipId,
          action,
          adminNote: adminNote[slipId] || ''
        })
      })
      const data = await res.json()
      setStoreLoading(false)
      if (res.ok) {
        toast({ title: action === 'approve' ? 'Approved!' : 'Rejected!', description: data.message })
        fetchStats()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      setStoreLoading(false)
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return
    setStoreLoading(true)
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          withdrawalId,
          action,
          adminNote: adminNote[withdrawalId] || ''
        })
      })
      const data = await res.json()
      setStoreLoading(false)
      if (res.ok) {
        toast({ title: action === 'approve' ? 'Approved!' : 'Rejected!', description: data.message })
        fetchStats()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      setStoreLoading(false)
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleToggleUser = async (targetUserId: string) => {
    if (!user?.id) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, targetUserId })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Updated!', description: data.message })
        fetchUsers()
        fetchStats()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleAddReview = async () => {
    if (!user?.id) return
    if (!newReview.name || !newReview.comment) {
      toast({ title: 'Error', description: 'Name and comment are required', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          name: newReview.name,
          rating: parseInt(newReview.rating),
          comment: newReview.comment
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Added!', description: data.message })
        setNewReview({ name: '', rating: '5', comment: '' })
        fetchReviews(1)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!user?.id) return
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, reviewId })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Deleted!', description: data.message })
        setReviews(prev => prev.filter(r => r.id !== reviewId))
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const tabItems = [
    { value: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'withdrawals', label: 'Withdrawals', icon: Banknote },
    { value: 'payments', label: 'Payments', icon: CreditCard },
    { value: 'reviews', label: 'Reviews', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-[#111827] text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16a34a] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Admin Panel</span>
              <span className="text-xs text-gray-400 block">EarnPro Management</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)}>
          <TabsList className="bg-white border border-gray-200/80 rounded-xl p-1 h-auto mb-6 shadow-sm">
            {tabItems.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg data-[state=active]:bg-[#16a34a] data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-50 transition-colors"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'green' },
                      { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'green' },
                      { label: 'Total Revenue', value: stats.totalRevenue, icon: Wallet, color: 'green', prefix: 'Rs. ' },
                      { label: 'Total Withdrawn', value: stats.totalPaid, icon: Banknote, color: 'gray', prefix: 'Rs. ' },
                    ].map((item, i) => (
                      <Card key={i} className="bg-white border border-gray-200/80">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              item.color === 'green' ? 'bg-green-50' : 'bg-gray-100'
                            }`}>
                              <item.icon className={`w-4 h-4 ${
                                item.color === 'green' ? 'text-[#16a34a]' : 'text-gray-500'
                              }`} />
                            </div>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#111827]">
                            {item.prefix || ''}<AnimatedCounter value={item.value} duration={1.5} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>

                {/* Pending Items */}
                {(stats.pendingSlips > 0 || stats.pendingWithdrawals > 0) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stats.pendingSlips > 0 && (
                        <Card
                          className="bg-amber-50 border-amber-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setActiveTab('payments')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-amber-700">{stats.pendingSlips}</p>
                              <p className="text-xs text-amber-600">Pending Payments</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {stats.pendingWithdrawals > 0 && (
                        <Card
                          className="bg-red-50 border-red-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setActiveTab('withdrawals')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-red-700">{stats.pendingWithdrawals}</p>
                              <p className="text-xs text-red-600">Pending Withdrawals</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Top Referrers */}
                {stats.topReferrers.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-white border border-gray-200/80">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#16a34a]" />
                          Top Referrers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {stats.topReferrers.map((u, i) => (
                            <div key={u.id} className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-xl">
                              <span className="w-7 h-7 rounded-full bg-[#16a34a] text-white text-xs flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#111827] truncate">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#16a34a]">Rs. {u.walletBalance}</p>
                                <p className="text-xs text-gray-400">{u._count.referrals} refs</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Recent Users */}
                {stats.recentUsers.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-white border border-gray-200/80">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#16a34a]" />
                          Recent Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {stats.recentUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 p-2.5 hover:bg-[#f9fafb] rounded-lg transition-colors">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {u.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#111827] truncate">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                              <Badge
                                variant={u.isActive ? 'secondary' : 'secondary'}
                                className={`text-xs ${
                                  u.isActive ? 'bg-green-50 text-[#16a34a]' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {u.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {allUsers.length > 0 ? (
              <Card className="bg-white border border-gray-200/80">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-[#f9fafb]">
                          <th className="text-left text-xs font-medium text-gray-500 p-4">User</th>
                          <th className="text-left text-xs font-medium text-gray-500 p-4 hidden sm:table-cell">Email</th>
                          <th className="text-center text-xs font-medium text-gray-500 p-4">Refs</th>
                          <th className="text-center text-xs font-medium text-gray-500 p-4">Balance</th>
                          <th className="text-center text-xs font-medium text-gray-500 p-4 hidden sm:table-cell">Status</th>
                          <th className="text-center text-xs font-medium text-gray-500 p-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u) => (
                          <tr key={u.id} className="border-b border-gray-50 hover:bg-[#f9fafb]/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                  {u.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[#111827] truncate max-w-[120px]">{u.name}</p>
                                  {u.role === 'admin' && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5">Admin</Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-gray-500 hidden sm:table-cell max-w-[160px] truncate">{u.email}</td>
                            <td className="p-4 text-center text-sm text-[#111827]">{u._count.referrals}</td>
                            <td className="p-4 text-center text-sm font-medium text-[#111827]">Rs. {u.walletBalance}</td>
                            <td className="p-4 text-center hidden sm:table-cell">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${u.isActive ? 'bg-green-50 text-[#16a34a]' : 'bg-gray-100 text-gray-500'}`}
                              >
                                {u.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              {u.role !== 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleUser(u.id)}
                                  className={`text-xs rounded-lg h-8 ${
                                    u.isActive
                                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                                      : 'border-green-200 text-[#16a34a] hover:bg-green-50'
                                  }`}
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200/80">
                <CardContent className="p-12 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No users found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            {stats?.pendingWithdrawalList && stats.pendingWithdrawalList.length > 0 ? (
              <div className="space-y-4">
                {stats.pendingWithdrawalList.map((w) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-white border border-gray-200/80">
                      <CardContent className="p-5 sm:p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-sm font-bold text-[#16a34a]">
                              {w.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#111827]">{w.user.name}</p>
                              <p className="text-xs text-gray-500">{w.user.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-amber-50 text-amber-700 text-xs">Pending</Badge>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-bold text-[#111827] text-lg">Rs. {w.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Method</p>
                            <p className="font-medium text-[#111827] capitalize">{w.method}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account</p>
                            <p className="font-medium text-[#111827] text-xs">{w.account}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Admin Note (optional)</Label>
                          <Input
                            placeholder="Add a note..."
                            value={adminNote[w.id] || ''}
                            onChange={(e) => setAdminNote(prev => ({ ...prev, [w.id]: e.target.value }))}
                            className="mt-1.5 h-10 border-gray-200 rounded-xl"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleWithdrawal(w.id, 'approve')}
                            disabled={isLoading}
                            className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white h-10 rounded-xl"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Approve</>}
                          </Button>
                          <Button
                            onClick={() => handleWithdrawal(w.id, 'reject')}
                            disabled={isLoading}
                            variant="destructive"
                            className="flex-1 h-10 rounded-xl"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1.5" /> Reject</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-gray-200/80">
                <CardContent className="p-12 text-center text-gray-400">
                  <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No pending withdrawals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            {stats?.pendingSlipList && stats.pendingSlipList.length > 0 ? (
              <div className="space-y-4">
                {stats.pendingSlipList.map((slip) => (
                  <motion.div key={slip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-white border border-gray-200/80">
                      <CardContent className="p-5 sm:p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-sm font-bold text-[#16a34a]">
                              {slip.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#111827]">{slip.user.name}</p>
                              <p className="text-xs text-gray-500">{slip.user.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-amber-50 text-amber-700 text-xs">Pending</Badge>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-semibold text-[#111827]">Rs. {slip.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Method</p>
                            <p className="font-semibold text-[#111827] capitalize">{slip.method}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reference</p>
                            <p className="font-semibold text-[#111827] text-xs">{slip.reference}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-semibold text-[#111827]">{slip.user.phone || 'N/A'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Submitted</p>
                            <p className="font-semibold text-[#111827]">{new Date(slip.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Admin Note (optional)</Label>
                          <Input
                            placeholder="Add a note..."
                            value={adminNote[slip.id] || ''}
                            onChange={(e) => setAdminNote(prev => ({ ...prev, [slip.id]: e.target.value }))}
                            className="mt-1.5 h-10 border-gray-200 rounded-xl"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleVerifySlip(slip.id, 'approve')}
                            disabled={isLoading}
                            className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white h-10 rounded-xl"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Approve</>}
                          </Button>
                          <Button
                            onClick={() => handleVerifySlip(slip.id, 'reject')}
                            disabled={isLoading}
                            variant="destructive"
                            className="flex-1 h-10 rounded-xl"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1.5" /> Reject</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-gray-200/80">
                <CardContent className="p-12 text-center text-gray-400">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No pending payment slips</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-white border border-gray-200/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#16a34a]" />
                  Add New Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Name</Label>
                    <Input
                      placeholder="User name"
                      value={newReview.name}
                      onChange={(e) => setNewReview(p => ({ ...p, name: e.target.value }))}
                      className="h-10 border-gray-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Rating</Label>
                    <Select value={newReview.rating} onValueChange={(v) => setNewReview(p => ({ ...p, rating: v }))}>
                      <SelectTrigger className="h-10 border-gray-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Comment</Label>
                  <Textarea
                    placeholder="Review comment..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
                    className="border-gray-200 rounded-xl resize-none"
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddReview} className="bg-[#16a34a] hover:bg-[#15803d] text-white h-10 rounded-xl">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Review
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">Total: {reviewTotal} reviews</p>
              {reviews.map((review) => (
                <Card key={review.id} className="bg-white border border-gray-200/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#111827]">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reviews.length < reviewTotal && (
                <Button
                  variant="outline"
                  className="w-full border-gray-200 rounded-xl"
                  onClick={() => {
                    const next = reviewPage + 1
                    setReviewPage(next)
                    fetchReviews(next)
                  }}
                >
                  Load More
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
