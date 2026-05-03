'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Star,
  Copy,
  Check,
  ArrowLeft,
  Plus,
  Banknote,
  Loader2,
  AlertCircle,
  ChevronRight,
  Send,
  TrendingUp,
  Clock,
  Gift,
  UserPlus,
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

interface Review {
  id: string
  name: string
  rating: number
  comment: string
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
  nextBonusAt: number | null
  referrals: Referral[]
  transactions: Transaction[]
  withdrawals: Transaction[]
}

export default function UserDashboard() {
  const { user, token, setView, logout, isLoading, setLoading } = useStore()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activeSection, setActiveSection] = useState<'main' | 'referrals' | 'withdraw' | 'reviews'>('main')
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('')
  const [withdrawAccount, setWithdrawAccount] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewPage, setReviewPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    void fetchDashboard()
  }, [user?.id, token])

  const fetchReviews = async (page: number) => {
    try {
      const res = await fetch(`/api/reviews?page=${page}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        if (page === 1) {
          setReviews(data.reviews)
        } else {
          setReviews(prev => [...prev, ...data.reviews])
        }
        setTotalReviews(data.total)
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (activeSection === 'reviews' && reviews.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on section change
      void fetchReviews(1)
    }
  }, [activeSection])

  const copyCode = () => {
    if (dashboardData?.user.referralCode) {
      navigator.clipboard.writeText(dashboardData.user.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareText = `Join EarnPro and earn Rs. 50 per referral! Use my code: ${dashboardData?.user.referralCode || ''}\nSign up now: ${typeof window !== 'undefined' ? window.location.origin : ''}?code=${dashboardData?.user.referralCode || ''}`

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawMethod || !withdrawAccount) {
      toast({ title: 'Error', description: 'Sab fields zaroori hain', variant: 'destructive' })
      return
    }
    if (!user?.id) return

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Valid amount enter karein', variant: 'destructive' })
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

  const referralProgress = Math.min((referralCount / 5) * 100, 100)
  const milestoneProgress = Math.min((referralCount / 10) * 100, 100)

  if (!dashboardData && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold text-emerald-700">EarnPro</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 border-0 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-2 text-emerald-100 text-sm mb-2">
                <Wallet className="w-4 h-4" />
                Wallet Balance
              </div>
              <div className="text-4xl font-extrabold">
                Rs. <AnimatedCounter value={balance} duration={1.5} />
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-emerald-200">
                <span>Withdrawn: Rs. {dashboardData?.user.totalWithdrawn || 0}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Counter Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-center gap-2 py-1">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                <AnimatedCounter value={25000} duration={3} suffix="+ Members" />
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Referral Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Referral Progress</span>
                <span className="text-sm text-muted-foreground">{referralCount} referrals</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 refs = Withdraw unlock</span>
                  <span>{Math.min(referralCount, 5)}/5</span>
                </div>
                <Progress value={referralProgress} className="h-2 bg-emerald-100" />
              </div>
              {referralCount < 10 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 refs = Rs. 50 bonus (Total: Rs. 500)</span>
                    <span>{referralCount}/10</span>
                  </div>
                  <Progress value={milestoneProgress} className="h-2 bg-amber-100" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Action Buttons */}
        <AnimatePresence mode="wait">
          {activeSection === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4"
            >
              {/* Add Users */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all"
                  onClick={() => setActiveSection('referrals')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">Add Users</h3>
                      <p className="text-sm text-muted-foreground">Referral code share karo aur kamao</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-emerald-600">{referralCount}</span>
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Withdraw */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer border-2 hover:shadow-lg transition-all ${
                    canWithdraw
                      ? 'border-amber-200 hover:border-amber-400'
                      : 'border-gray-200 opacity-80'
                  }`}
                  onClick={() => setActiveSection('withdraw')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      canWithdraw ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      <Banknote className={`w-7 h-7 ${canWithdraw ? 'text-amber-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">Withdraw</h3>
                      <p className="text-sm text-muted-foreground">
                        {canWithdraw ? 'Paisa withdraw karein' : '5 referrals chahiye'}
                      </p>
                    </div>
                    {!canWithdraw && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reviews */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                  onClick={() => setActiveSection('reviews')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Star className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">Reviews</h3>
                      <p className="text-sm text-muted-foreground">User reviews dekhein</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Referrals Section */}
          {activeSection === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Button variant="ghost" onClick={() => setActiveSection('main')} className="text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <Card className="border-emerald-200">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-lg font-bold">Apna Referral Code</h3>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg px-6 py-3">
                      <span className="text-2xl font-bold text-emerald-700 tracking-widest">
                        {dashboardData?.user.referralCode}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyCode}
                      className="border-emerald-300"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Har referral par Rs. 50! Dosto ko share karo.
                  </div>
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Join EarnPro', text: shareText })
                      } else {
                        navigator.clipboard.writeText(shareText)
                        toast({ title: 'Copied!', description: 'Share text clipboard mein copy ho gayi' })
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Share Code
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    Referred Users ({referralCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.referrals && dashboardData.referrals.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {dashboardData.referrals.map((ref) => (
                        <div key={ref.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                            {ref.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{ref.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{ref.email}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Abhi tak koi referral nahi</p>
                      <p className="text-xs">Apna code share karo!</p>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Button variant="ghost" onClick={() => setActiveSection('main')} className="text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {!canWithdraw && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 text-sm">Minimum 5 Referrals Required</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Aapko abhi {5 - referralCount} aur referrals chahiye withdrawal ke liye
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className={!canWithdraw ? 'opacity-60 pointer-events-none' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-amber-500" />
                    Withdraw Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      Rs. {balance.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label>Amount (Rs.)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={balance}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="easypaisa">Easypaisa</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Account Number</Label>
                    <Input
                      placeholder="JazzCash/Easypaisa/Bank Account Number"
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={isLoading || !canWithdraw}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-5"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4 mr-2" />
                        Submit Withdrawal
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews Section */}
          {activeSection === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Button variant="ghost" onClick={() => setActiveSection('main')} className="text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <div className="text-center mb-2">
                <h3 className="text-xl font-bold">User Reviews</h3>
                <p className="text-sm text-muted-foreground">10,000+ Happy Members</p>
              </div>

              <div className="space-y-3">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                            {review.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{review.name}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {reviews.length < totalReviews && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const nextPage = reviewPage + 1
                    setReviewPage(nextPage)
                    fetchReviews(nextPage)
                  }}
                >
                  Load More Reviews
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Transactions */}
        {activeSection === 'main' && dashboardData?.transactions && dashboardData.transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dashboardData.transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.amount > 0 ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'referral_bonus' ? (
                          <Gift className="w-4 h-4 text-emerald-600" />
                        ) : tx.type === 'milestone_bonus' ? (
                          <Star className="w-4 h-4 text-amber-600" />
                        ) : tx.type === 'withdrawal' ? (
                          <Banknote className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
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

function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
