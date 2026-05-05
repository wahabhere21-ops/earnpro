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
  Wallet,
  Upload,
} from 'lucide-react'

export default function PaymentScreen() {
  const { user, setView, isLoading, setLoading } = useStore()
  const { toast } = useToast()
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const jazzCashNumber = '03257726221'

  const handleSubmit = async () => {
    if (!method) {
      toast({ title: 'Error', description: 'Select a payment method', variant: 'destructive' })
      return
    }
    if (!reference.trim()) {
      toast({ title: 'Error', description: 'Reference / Transaction ID is required', variant: 'destructive' })
      return
    }
    if (!user?.id) {
      toast({ title: 'Error', description: 'User data not found', variant: 'destructive' })
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

  const copyNumber = () => {
    navigator.clipboard.writeText(jazzCashNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('landing')} className="text-gray-500 hover:text-gray-700">
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

      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Fee Info Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-[#16a34a] to-[#15803d] border-0 text-white overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-2 text-green-100 text-sm mb-3">
                      <CreditCard className="w-4 h-4" />
                      Activation Fee
                    </div>
                    <p className="text-3xl font-bold">Rs. 100</p>
                    <p className="text-green-100/80 text-sm mt-2">
                      One-time fee to activate your account and start earning
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="bg-white border border-gray-200/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#16a34a]" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#f9fafb] rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Account Name</p>
                          <p className="font-semibold text-[#111827] mt-0.5">EarnPro</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">JazzCash Number</p>
                            <p className="font-bold text-lg text-[#111827] mt-0.5 font-mono">{jazzCashNumber}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyNumber}
                            className="h-8 px-3 border-gray-200 rounded-lg text-xs"
                          >
                            {copied ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1 text-[#16a34a]" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3 mr-1" /> Copy</>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Amount to Send</p>
                        <p className="font-bold text-lg text-[#16a34a] mt-0.5">Rs. 100</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Send exactly Rs. 100 to the number above, then enter the transaction reference below.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white border border-gray-200/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-[#111827]">
                      Submit Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Select method" />
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
                              <Smartphone className="w-4 h-4 text-green-600" />
                              EasyPaisa
                            </div>
                          </SelectItem>
                          <SelectItem value="bank">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-500" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Transaction Reference</Label>
                      <Input
                        placeholder="e.g., TRX123456789"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="h-11 border-gray-200 rounded-xl"
                      />
                      <p className="text-xs text-gray-400">
                        Enter the transaction ID you received after making the payment
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-medium h-11 rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Payment Proof
                        </>
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
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-[#16a34a]" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-2">
                  Payment Submitted
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                  Your payment proof has been submitted. We will review it and activate your account shortly.
                </p>
              </div>
              <Card className="max-w-sm mx-auto bg-white border border-gray-200/80">
                <CardContent className="p-5">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Method</span>
                      <span className="text-sm font-medium text-[#111827] capitalize">{method}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Reference</span>
                      <span className="text-sm font-medium text-[#111827] font-mono">{reference}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-gray-400">
                You will be able to access your dashboard once the payment is approved.
              </p>
              <Button onClick={() => setView('landing')} variant="outline" className="border-gray-200 rounded-xl">
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

function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
