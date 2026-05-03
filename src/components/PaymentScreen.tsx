'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
  CheckCircle2,
  Copy,
  Shield,
} from 'lucide-react'

export default function PaymentScreen() {
  const { user, setView, isLoading, setLoading } = useStore()
  const { toast } = useToast()
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const paymentDetails = {
    jazzcash: '0325-7726221',
    easypaisa: '0325-7726221',
    bank: 'Account: EarnPro - IBAN: PK36ABCD0000001234567890'
  }

  const handleSubmit = async () => {
    if (!method) {
      toast({ title: 'Error', description: 'Payment method select karein', variant: 'destructive' })
      return
    }
    if (!reference.trim()) {
      toast({ title: 'Error', description: 'Reference/Transaction ID zaroori hai', variant: 'destructive' })
      return
    }
    if (!user?.id) {
      toast({ title: 'Error', description: 'User data nahi mili', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          method,
          reference: reference.trim()
        })
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setSubmitted(true)
        toast({ title: 'Submitted!', description: data.message })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      setLoading(false)
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  const copyNumber = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('landing')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold text-emerald-700">EarnPro</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 border-amber-200 bg-amber-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Pay Rs. 100
                    </h2>
                    <p className="text-muted-foreground">
                      Account activate karne ke liye Rs. 100 pay karein
                    </p>
                    <div className="text-4xl font-extrabold text-amber-600 mt-3">
                      Rs. 100
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="font-semibold text-foreground">EarnPro</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyNumber('EarnPro')}
                          className="text-xs"
                        >
                          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-muted-foreground">JazzCash / Easypaisa Number</p>
                        <p className="font-bold text-lg text-foreground">0325-7726221</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-bold text-lg text-emerald-600">Rs. 100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Method Select Karein</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="JazzCash / Easypaisa / Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jazzcash">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-red-500" />
                              JazzCash
                            </div>
                          </SelectItem>
                          <SelectItem value="easypaisa">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-green-500" />
                              Easypaisa
                            </div>
                          </SelectItem>
                          <SelectItem value="bank">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Reference / Transaction ID</Label>
                      <Input
                        placeholder="e.g., TRX123456789"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment ke baad jo transaction ID aata hai woh yahan enter karein
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Payment Slip'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Payment Slip Submitted! 🎉
                </h2>
                <p className="text-muted-foreground text-lg">
                  Admin aapki payment verify karega. Yeh kuch time le sakta hai.
                </p>
              </div>
              <Card className="max-w-sm mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium capitalize">{method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-medium">{reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-amber-600">Pending Verification</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground">
                Login karte raho! Admin approve karne ke baad aap dashboard dekh payenge.
              </p>
              <Button onClick={() => setView('landing')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
