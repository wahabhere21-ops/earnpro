'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Wallet,
  Users,
  Copy,
  Check,
  Banknote,
  Loader2,
  AlertCircle,
  Send,
  Gift,
  Clock,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react'

interface Referral {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  createdAt: string
}

interface Withdrawal {
  id: string
  amount: number
  method: string
  account: string
  status: string
  createdAt: string
}

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    referralCode: string
    walletBalance: number
    totalWithdrawn: number
    role: string
    isActive: boolean
  }
  referralCount: number
  canWithdraw: boolean
  referrals: Referral[]
  transactions: Transaction[]
  withdrawals: Withdrawal[]
}

export default function UserDashboard() {
  const { user, token, setView, logout, isLoading, setLoading } = useStore()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activeSection, setActiveSection] = useState<'main' | 'referrals' | 'withdraw'>('main')
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('')
  const [withdrawAccount, setWithdrawAccount] = useState('')

  const fetchDashboard = async () => {
    if (!user?.id || !token) return
    try {
      const res = await fetch('/api/user/dashboard', {
        headers: { 'x-user-id': user.id }
      })
      if (res.ok) {
        const data = await res.json()
        setDashboardData(data)
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    void fetchDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token])

  const copyCode = () => {
    if (dashboardData?.user.referralCode) {
      navigator.clipboard.writeText(dashboardData.user.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Copied!', description: 'Referral code copied to clipboard' })
    }
  }

  const shareText = `Join EarnPro and earn Rs. 50 per referral! Use my code: ${dashboardData?.user.referralCode || ''}\nSign up now: ${typeof window !== 'undefined' ? window.location.origin : ''}?code=${dashboardData?.user.referralCode || ''}`

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join EarnPro', text: shareText })
    } else {
      navigator.clipboard.writeText(shareText)
      toast({ title: 'Copied!', description: 'Share text copied to clipboard' })
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawMethod || !withdrawAccount) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' })
      return
    }
    if (!user?.id) return

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Enter a valid amount', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          method: withdrawMethod,
          account: withdrawAccount
        })
      })
      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        toast({ title: 'Withdrawal Submitted!', description: data.message })
        setWithdrawAmount('')
        setWithdrawMethod('')
        setWithdrawAccount('')
        setActiveSection('main')
        fetchDashboard()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      setLoading(false)
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const balance = dashboardData?.user.walletBalance || 0
  const referralCount = dashboardData?.referralCount || 0
  const canWithdraw = dashboardData?.canWithdraw || false

  if (!dashboardData && !isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#16a34a] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#16a34a] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#111827] tracking-tight">EarnPro</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={logout} className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s your account overview</p>
        </div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-[#16a34a] to-[#15803d] border-0 text-white overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-100 text-sm mb-2">
                    <Wallet className="w-4 h-4" />
                    Wallet Balance
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold">
                    Rs. <AnimatedCounter value={balance} duration={1.5} />
                  </div>
                  <div className="mt-2 text-sm text-green-200/80">
                    Total Withdrawn: Rs. {dashboardData?.user.totalWithdrawn || 0}
                  </div>
                </div>
                <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
                  <Wallet className="w-8 h-8 text-white/80" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="bg-white border border-gray-200/80">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-xl font-bold text-[#111827]">{referralCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200/80">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-xl font-bold text-[#111827]">Rs. {balance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200/80">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <ArrowUpFromLine className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Withdrawn</p>
                <p className="text-xl font-bold text-[#111827]">Rs. {(dashboardData?.user.totalWithdrawn || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-white border border-gray-200/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#16a34a]" />
                Your Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#f9fafb] border border-dashed border-gray-300 rounded-xl px-5 py-3 text-center">
                  <span className="text-xl font-bold text-[#16a34a] tracking-widest font-mono">
                    {dashboardData?.user.referralCode}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={copyCode}
                  className="h-11 px-4 border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  {copied ? <Check className="w-4 h-4 text-[#16a34a]" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </Button>
                <Button
                  onClick={handleShare}
                  className="h-11 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Card
              className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                activeSection === 'referrals'
                  ? 'border-[#16a34a] bg-green-50/50'
                  : 'border-gray-200/80 bg-white'
              }`}
              onClick={() => setActiveSection(activeSection === 'referrals' ? 'main' : 'referrals')}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#16a34a]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#111827]">Referrals</h3>
                  <p className="text-xs text-gray-500">View your referred users</p>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-[#16a34a] text-xs font-medium">
                  {referralCount}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Card
              className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                activeSection === 'withdraw'
                  ? 'border-[#16a34a] bg-green-50/50'
                  : 'border-gray-200/80 bg-white'
              }`}
              onClick={() => setActiveSection(activeSection === 'withdraw' ? 'main' : 'withdraw')}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  canWithdraw ? 'bg-green-50' : 'bg-gray-100'
                }`}>
                  <Banknote className={`w-6 h-6 ${canWithdraw ? 'text-[#16a34a]' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#111827]">Withdraw</h3>
                  <p className="text-xs text-gray-500">
                    {canWithdraw ? 'Request a withdrawal' : `${5 - referralCount} more referrals needed`}
                  </p>
                </div>
                {!canWithdraw && (
                  <Badge variant="secondary" className="text-xs text-gray-500">Locked</Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Expandable Sections */}
        <AnimatePresence mode="wait">
          {/* Referrals Section */}
          {activeSection === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-white border border-gray-200/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-[#111827]">
                    Referred Users ({referralCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.referrals && dashboardData.referrals.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {dashboardData.referrals.map((ref) => (
                        <div key={ref.id} className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-xl">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-[#16a34a]">
                            {ref.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#111827] truncate">{ref.name}</p>
                            <p className="text-xs text-gray-500 truncate">{ref.email}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No referrals yet</p>
                      <p className="text-xs">Share your code to start earning</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Withdraw Section */}
          {activeSection === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {!canWithdraw && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Minimum 5 Referrals Required</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          You need {5 - referralCount} more referrals to be able to withdraw.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className={`bg-white border border-gray-200/80 ${!canWithdraw ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#16a34a]" />
                      Request Withdrawal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="bg-[#f9fafb] rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Available Balance</p>
                      <p className="text-2xl font-bold text-[#111827] mt-1">
                        Rs. {balance.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Amount (Rs.)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        max={balance}
                        className="h-11 border-gray-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                      <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                        <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jazzcash">JazzCash</SelectItem>
                          <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        className="h-11 border-gray-200 rounded-xl"
                      />
                    </div>

                    <Button
                      onClick={handleWithdraw}
                      disabled={isLoading || !canWithdraw}
                      className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-medium h-11 rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-4 h-4 mr-2" />
                          Request Withdrawal
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Withdrawals */}
                {dashboardData?.withdrawals && dashboardData.withdrawals.length > 0 && (
                  <Card className="bg-white border border-gray-200/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-[#111827]">
                        Recent Withdrawals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Amount</th>
                              <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4 hidden sm:table-cell">Method</th>
                              <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Status</th>
                              <th className="text-left text-xs font-medium text-gray-500 pb-3">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.withdrawals.map((w) => (
                              <tr key={w.id} className="border-b border-gray-50 last:border-0">
                                <td className="py-3 pr-4 text-sm font-medium text-[#111827]">Rs. {w.amount}</td>
                                <td className="py-3 pr-4 text-sm text-gray-500 capitalize hidden sm:table-cell">{w.method}</td>
                                <td className="py-3 pr-4">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      w.status === 'approved'
                                        ? 'bg-green-50 text-green-700'
                                        : w.status === 'rejected'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    {w.status}
                                  </Badge>
                                </td>
                                <td className="py-3 text-xs text-gray-400">
                                  {new Date(w.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Activity */}
        {activeSection === 'main' && dashboardData?.transactions && dashboardData.transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white border border-gray-200/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-[#16a34a]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {dashboardData.transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f9fafb] transition-colors">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.amount > 0 ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {tx.type === 'referral_bonus' ? (
                          <Gift className="w-4 h-4 text-[#16a34a]" />
                        ) : tx.type === 'milestone_bonus' ? (
                          <Gift className="w-4 h-4 text-amber-500" />
                        ) : tx.type === 'withdrawal' ? (
                          <Banknote className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111827] truncate">{tx.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold flex-shrink-0 ${
                        tx.amount > 0 ? 'text-[#16a34a]' : 'text-red-500'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}Rs. {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
