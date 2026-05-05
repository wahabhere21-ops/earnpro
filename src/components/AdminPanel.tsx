'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Shield,
  DollarSign,
  Clock,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    void fetchStats()
  }, [user?.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on tab change
    if (activeTab === 'users') void fetchUsers()
  }, [activeTab])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on tab change
    if (activeTab === 'reviews' && reviews.length === 0) void fetchReviews(1)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">EarnPro Admin</span>
              <span className="text-xs text-gray-400 block">Control Panel</span>
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)}>
          <TabsList className="grid grid-cols-5 mb-6 bg-white shadow-sm rounded-xl p-1 h-auto">
            {[
              { value: 'overview', label: 'Overview', icon: LayoutDashboard },
              { value: 'payments', label: 'Payments', icon: CreditCard },
              { value: 'users', label: 'Users', icon: Users },
              { value: 'withdrawals', label: 'Withdrawals', icon: Banknote },
              { value: 'reviews', label: 'Reviews', icon: Star },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col items-center gap-1 py-2.5 px-2 text-xs rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=inactive]:text-gray-500"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'emerald' },
                      { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, color: 'emerald', prefix: 'Rs. ' },
                      { label: 'Admin Profit', value: stats.adminProfit, icon: TrendingUp, color: 'amber', prefix: 'Rs. ' },
                      { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'emerald' },
                    ].map((item, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              item.color === 'emerald' ? 'bg-emerald-100' : 'bg-amber-100'
                            }`}>
                              <item.icon className={`w-4 h-4 ${
                                item.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
                              }`} />
                            </div>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold">
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
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-amber-200 bg-amber-50 cursor-pointer" onClick={() => setActiveTab('payments')}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-700">{stats.pendingSlips}</p>
                            <p className="text-xs text-amber-600">Pending Payments</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-rose-200 bg-rose-50 cursor-pointer" onClick={() => setActiveTab('withdrawals')}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-rose-700">{stats.pendingWithdrawals}</p>
                            <p className="text-xs text-rose-600">Pending Withdrawals</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {/* Top Referrers */}
                {stats.topReferrers.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          Top Referrers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {stats.topReferrers.map((u, i) => (
                            <div key={u.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-emerald-600">Rs. {u.walletBalance}</p>
                                <p className="text-xs text-muted-foreground">{u._count.referrals} refs</p>
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
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-500" />
                          Recent Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {stats.recentUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 p-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                {u.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                              <Badge variant={u.isActive ? 'default' : 'secondary'} className={
                                u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                              }>
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

          {/* Payments Tab */}
          <TabsContent value="payments">
            {stats?.pendingSlipList && stats.pendingSlipList.length > 0 ? (
              <div className="space-y-4">
                {stats.pendingSlipList.map((slip) => (
                  <motion.div key={slip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                              {slip.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{slip.user.name}</p>
                              <p className="text-xs text-muted-foreground">{slip.user.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Amount</p>
                            <p className="font-semibold">Rs. {slip.amount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Method</p>
                            <p className="font-semibold capitalize">{slip.method}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Reference</p>
                            <p className="font-semibold text-xs">{slip.reference}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Phone</p>
                            <p className="font-semibold">{slip.user.phone || 'N/A'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground text-xs">Submitted</p>
                            <p className="font-semibold">{new Date(slip.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Admin Note (optional)</Label>
                          <Input
                            placeholder="Add a note..."
                            value={adminNote[slip.id] || ''}
                            onChange={(e) => setAdminNote(prev => ({ ...prev, [slip.id]: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleVerifySlip(slip.id, 'approve')}
                            disabled={isLoading}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                          </Button>
                          <Button
                            onClick={() => handleVerifySlip(slip.id, 'reject')}
                            disabled={isLoading}
                            variant="destructive"
                            className="flex-1"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" /> Reject</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No pending payment slips</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {allUsers.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left text-xs font-medium text-muted-foreground p-3">User</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden sm:table-cell">Email</th>
                          <th className="text-center text-xs font-medium text-muted-foreground p-3">Refs</th>
                          <th className="text-center text-xs font-medium text-muted-foreground p-3">Balance</th>
                          <th className="text-center text-xs font-medium text-muted-foreground p-3 hidden sm:table-cell">Status</th>
                          <th className="text-center text-xs font-medium text-muted-foreground p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u) => (
                          <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                  {u.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate max-w-[100px]">{u.name}</p>
                                  {u.role === 'admin' && <Badge variant="outline" className="text-xs py-0">Admin</Badge>}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">{u.email}</td>
                            <td className="p-3 text-center text-sm">{u._count.referrals}</td>
                            <td className="p-3 text-center text-sm font-medium">Rs. {u.walletBalance}</td>
                            <td className="p-3 text-center hidden sm:table-cell">
                              <Badge variant={u.isActive ? 'default' : 'secondary'} className={
                                u.isActive ? 'bg-emerald-100 text-emerald-700' : ''
                              }>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              {u.role !== 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleUser(u.id)}
                                  className={`text-xs ${u.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
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
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No users found</p>
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
                    <Card>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                              {w.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{w.user.name}</p>
                              <p className="text-xs text-muted-foreground">{w.user.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Amount</p>
                            <p className="font-bold text-lg text-amber-600">Rs. {w.amount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Method</p>
                            <p className="font-semibold capitalize">{w.method}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Account</p>
                            <p className="font-semibold text-xs">{w.account}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Admin Note (optional)</Label>
                          <Input
                            placeholder="Add a note..."
                            value={adminNote[w.id] || ''}
                            onChange={(e) => setAdminNote(prev => ({ ...prev, [w.id]: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleWithdrawal(w.id, 'approve')}
                            disabled={isLoading}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                          </Button>
                          <Button
                            onClick={() => handleWithdrawal(w.id, 'reject')}
                            disabled={isLoading}
                            variant="destructive"
                            className="flex-1"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" /> Reject</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Banknote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No pending withdrawals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Add Review Form */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Add New Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      placeholder="User name"
                      value={newReview.name}
                      onChange={(e) => setNewReview(p => ({ ...p, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rating</Label>
                    <Select value={newReview.rating} onValueChange={(v) => setNewReview(p => ({ ...p, rating: v }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Stars)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ (4 Stars)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Comment</Label>
                  <Textarea
                    placeholder="Review comment..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddReview} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add Review
                </Button>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Total: {reviewTotal} reviews</p>
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700 flex-shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
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
                  className="w-full"
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
