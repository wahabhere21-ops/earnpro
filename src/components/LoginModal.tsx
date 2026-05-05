'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  Loader2,
  AlertCircle,
  ArrowRight,
  Wallet,
} from 'lucide-react'

export default function LoginModal() {
  const { setView, setUser, setToken, isLoading, setLoading, setError, error, success, setSuccess } = useStore()
  const { toast } = useToast()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [pendingUser, setPendingUser] = useState<{ id: string; isActive: boolean } | null>(null)

  // Auto-fill referral code from URL param ?code=XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setReferralCode(code.toUpperCase())
    }
  }, [])

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const loginData = await loginRes.json()

      if (loginRes.ok) {
        setUser(loginData.user)
        setToken(loginData.token)
        setLoading(false)

        if (loginData.user.role === 'admin') {
          setView('admin')
        } else if (loginData.user.hasPaidFee) {
          setView('dashboard')
        } else {
          setView('payment')
        }
        toast({ title: 'Welcome back!', description: `Hello ${loginData.user.name}!` })
        return
      }

      if (loginRes.status === 403) {
        setPendingUser(loginData.user)
        setLoading(false)
        setView('payment')
        toast({
          title: 'Payment Pending',
          description: 'Your payment is pending verification.',
          variant: 'destructive'
        })
        return
      }

      if (loginRes.status === 404) {
        setLoading(false)
        setMode('signup')
        toast({ title: 'Account not found', description: 'Please create an account to continue.' })
        return
      }

      setLoading(false)
      setError(loginData.error || 'Login failed. Please try again.')
    } catch {
      setLoading(false)
      setError('Network error. Please try again.')
    }
  }

  const handleSignup = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const registerBody: Record<string, string> = {
        name: name.trim(),
        email: email.trim()
      }
      if (phone.trim()) registerBody.phone = phone.trim()
      if (referralCode.trim()) registerBody.referralCode = referralCode.trim().toUpperCase()

      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerBody)
      })

      const registerData = await registerRes.json()

      if (registerRes.ok) {
        setUser(registerData.user)
        setToken(Date.now().toString())
        setLoading(false)

        if (registerData.user.hasPaidFee) {
          setView('dashboard')
          toast({ title: 'Welcome!', description: 'Your account is ready. Check your dashboard!' })
        } else {
          setView('payment')
          toast({ title: 'Account Created!', description: 'Please complete the payment to activate your account.' })
        }
        return
      }

      if (registerRes.status === 409) {
        setLoading(false)
        setMode('login')
        toast({ title: 'Email exists', description: 'An account with this email already exists. Please log in.' })
        return
      }

      setLoading(false)
      setError(registerData.error || 'Registration failed. Please try again.')
    } catch {
      setLoading(false)
      setError('Network error. Please try again.')
    }
  }

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin()
    } else {
      handleSignup()
    }
  }

  const handleGoBack = () => {
    if (!isLoading) {
      setView('landing')
      setError(null)
      setSuccess(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#111827]">EarnPro</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#111827]">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {mode === 'login'
                  ? 'Enter your email to sign in to your account'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* Name (signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-[#16a34a] focus:ring-[#16a34a]/20 rounded-xl"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-[#16a34a] focus:ring-[#16a34a]/20 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              </div>

              {/* Phone (signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number <span className="text-gray-400">(optional)</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="03XX XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-[#16a34a] focus:ring-[#16a34a]/20 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Referral Code (signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="referral" className="text-sm font-medium text-gray-700">Referral Code <span className="text-gray-400">(optional)</span></Label>
                  <Input
                    id="referral"
                    placeholder="e.g., ABCD1234"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="h-11 border-gray-200 focus:border-[#16a34a] focus:ring-[#16a34a]/20 rounded-xl"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-400">Have a referral code from a friend? Enter it here.</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-medium h-11 rounded-xl shadow-sm shadow-green-200 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Toggle Mode */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login')
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-[#16a34a] font-medium hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
