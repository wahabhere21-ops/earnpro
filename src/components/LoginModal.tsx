'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/store/useStore'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, User, ArrowRight, AlertCircle, KeyRound } from 'lucide-react'

export default function LoginModal() {
  const { setView, setUser, setToken, setView: setStoreView, user, isLoading, setLoading, setError } = useStore()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [step, setStep] = useState<'input' | 'loading'>('input')
  const [pendingUser, setPendingUser] = useState<{ id: string; isActive: boolean } | null>(null)

  // Auto-fill referral code from URL param ?code=XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setReferralCode(code.toUpperCase())
    }
  }, [])

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast({ title: 'Error', description: 'Email zaroori hai', variant: 'destructive' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: 'Error', description: 'Ghalat email format', variant: 'destructive' })
      return
    }

    setLoading(true)
    setStep('loading')

    try {
      const registerBody: Record<string, string> = {
        name: name || email.split('@')[0],
        email: email.trim()
      }
      if (referralCode.trim()) {
        registerBody.referralCode = referralCode.trim().toUpperCase()
      }

      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerBody)
      })

      const registerData = await registerRes.json()

      if (registerRes.ok) {
        // New user created
        setUser(registerData.user)
        setToken(Date.now().toString())
        setLoading(false)
        setIsOpen(false)

        // isActive check handles both free login and paid users
        if (registerData.user.isActive) {
          setStoreView('dashboard')
          if (referralCode.trim()) {
            toast({ title: 'Welcome!', description: 'Account ready! Referral code apply ho gaya.' })
          } else {
            toast({ title: 'Welcome!', description: 'Account ready - dashboard dekhein!' })
          }
        } else {
          if (referralCode.trim()) {
            toast({ title: 'Account Created!', description: 'Referral code apply ho gaya! Ab payment karein.' })
          } else {
            toast({ title: 'Account Created!', description: 'Ab payment karein account activate karne ke liye' })
          }
          setStoreView('payment')
        }
        return
      }

      if (registerRes.status === 409) {
        // Email already exists - try login
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
          setIsOpen(false)

          if (loginData.user.role === 'admin') {
            setStoreView('admin')
          } else {
            setStoreView('dashboard')
          }
          toast({ title: 'Welcome back!', description: `Hello ${loginData.user.name}!` })
          return
        }

        if (loginRes.status === 403) {
          setPendingUser(loginData.user)
          setLoading(false)
          setStep('input')
          toast({
            title: 'Payment Pending',
            description: 'Admin ne abhi aapki payment verify nahi ki',
            variant: 'destructive'
          })
          return
        }

        setLoading(false)
        setStep('input')
        toast({ title: 'Error', description: loginData.error, variant: 'destructive' })
        return
      }

      setLoading(false)
      setStep('input')
      toast({ title: 'Error', description: registerData.error, variant: 'destructive' })
    } catch {
      setLoading(false)
      setStep('input')
      toast({ title: 'Error', description: 'Network error. Dobara try karein.', variant: 'destructive' })
    }
  }

  const goToPayment = () => {
    setIsOpen(false)
    setStoreView('payment')
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
      setStoreView('landing')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-center text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <span className="text-3xl font-bold text-emerald-600">E</span>
          </motion.div>
          <DialogTitle className="text-xl font-bold text-white">
            Sign in with EarnPro
          </DialogTitle>
          <p className="text-emerald-100 text-sm mt-1">
            Enter your details to continue
          </p>
        </div>

        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {pendingUser && !pendingUser.isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Payment Pending</p>
                      <p className="text-xs text-amber-600 mt-0.5">Admin ne abhi aapki payment verify nahi ki</p>
                    </div>
                  </motion.div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Aapka naam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="referral" className="text-emerald-700 font-semibold">
                      <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                      Referral Code (Optional)
                    </Label>
                    {referralCode && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium"
                      >
                        Code Applied
                      </motion.span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <Input
                      id="referral"
                      placeholder="e.g., ABCD1234"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="pl-10 border-emerald-200 focus:border-emerald-500 bg-emerald-50/50"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kisi dost ne diya hai? Code yahan daalein - Rs. 50 bonus referrer ko milega!
                  </p>
                </div>

                {pendingUser && !pendingUser.isActive && (
                  <Button
                    variant="outline"
                    onClick={goToPayment}
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Go to Payment Screen
                  </Button>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 text-base font-semibold"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to our Terms of Service
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 space-y-4"
              >
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-muted-foreground text-sm">Processing...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
