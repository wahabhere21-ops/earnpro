'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AnimatedCounter from './AnimatedCounter'
import {
  Users,
  Wallet,
  TrendingUp,
  Star,
  ChevronRight,
  Shield,
  Zap,
  Gift,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react'
import { useStore } from '@/store/useStore'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.03, y: -4 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 300 }
}

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

export default function LandingPage() {
  const { setView } = useStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/reviews?page=1&limit=10')
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || [])
        setTotalReviews(data.total || 0)
      })
      .catch(() => {})
  }, [])

  const handleJoin = () => setView('login')
  const handleLogin = () => setView('login')

  const copyReferral = () => {
    navigator.clipboard.writeText('EARNPRO100')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-700">EarnPro</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" onClick={handleLogin} className="text-sm sm:text-base">
              Login
            </Button>
            <Button
              onClick={handleJoin}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm sm:text-base"
            >
              Join Now <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* FBR Approved Trust Badge */}
      <div className="bg-green-600 text-white text-center text-sm py-2 px-4 font-medium">
        ✅ FBR Approved &amp; Government Registered Platform | Secure &amp; Verified
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                #1 Referral Platform in Pakistan
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight"
            >
              Only{' '}
              <span className="text-emerald-500">Rs. 100</span> Fee,
              <br />
              <span className="text-amber-500">Rs. 50</span> Per Referral!
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Invite friends and earn money! Rs. 50 in your wallet per referral.
              Extra bonus at 10 referrals! Total Rs. 500 at 10 refs!
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                onClick={handleJoin}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6 rounded-xl"
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={copyReferral}
                className="text-lg px-8 py-6 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? 'Copied!' : 'Code: EARNPRO100'}
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-8"
            >
              {[
                { value: 25000, suffix: '+', label: 'Users' },
                { value: 100, prefix: 'Rs. ', suffix: '', label: 'Joining Fee' },
                { value: 50, prefix: 'Rs. ', suffix: '', label: 'Per Referral' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">
                    <AnimatedCounter
                      value={stat.value}
                      prefix={stat.prefix || ''}
                      suffix={stat.suffix}
                      duration={2}
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
              How Does It Work?
            </h2>
            <p className="text-muted-foreground text-lg">Just 3 simple steps!</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Wallet className="w-8 h-8" />,
                title: 'Step 1: Sign Up',
                desc: 'Pay Rs. 100 fee via JazzCash/Easypaisa. Your account will be activated.',
                color: 'emerald',
                step: '01'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Step 2: Share & Refer',
                desc: 'Share your referral code with friends. Earn Rs. 50 per sign up!',
                color: 'amber',
                step: '02'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Step 3: Earn & Withdraw',
                desc: '5 refs = Rs. 250 withdrawal. 10 refs = Rs. 500 bonus! Money directly in your wallet!',
                color: 'rose',
                step: '03'
              }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} {...scaleOnHover}>
                <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardContent className="p-6 sm:p-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white ${
                      item.color === 'emerald' ? 'bg-emerald-500' :
                      item.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="text-5xl font-black text-muted-foreground/10 absolute top-4 right-4">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Earning Calculator */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 to-amber-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
              Earning Calculator
            </h2>
            <p className="text-muted-foreground text-lg">Calculate your earnings!</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { refs: 5, amount: 250, label: 'First Withdrawal' },
              { refs: 10, amount: 500, label: 'Milestone Bonus! 🎉' },
              { refs: 20, amount: 1000, label: 'Double Digit Earner' },
              { refs: 50, amount: 2550, label: 'Super Earner! 🔥' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} {...scaleOnHover}>
                <Card className="text-center border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="text-4xl sm:text-5xl mb-3">👥</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      <AnimatedCounter value={item.refs} suffix=" Refs" duration={1.5} />
                    </div>
                    <div className="text-3xl font-extrabold text-foreground my-2">
                      Rs. <AnimatedCounter value={item.amount} duration={2} />
                    </div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
              Why Choose EarnPro? 🤔
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-3 gap-6"
          >
            {[
              { icon: <Shield className="w-7 h-7" />, title: '100% Trusted', desc: 'Trusted by thousands of users. Payments always on time.' },
              { icon: <Zap className="w-7 h-7" />, title: 'Instant Withdrawal', desc: 'Instant approval when you request withdrawal.' },
              { icon: <Gift className="w-7 h-7" />, title: 'Bonus Rewards', desc: 'Rs. 50 extra bonus at 10 refs! Total Rs. 500!' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="border-emerald-100 hover:shadow-lg transition-shadow text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-2">
              10,000+ Happy Members
            </h2>
            <p className="text-emerald-200 text-lg">See what our users say</p>
          </motion.div>

          <div className="relative" ref={scrollRef}>
            <div className="flex gap-4 overflow-hidden">
              <AnimatePresence>
                <motion.div
                  animate={{ x: [0, -1200] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="flex gap-4"
                >
                  {[...reviews, ...reviews, ...reviews].map((review, i) => (
                    <Card
                      key={`${review.id}-${i}`}
                      className="min-w-[280px] sm:min-w-[320px] bg-white/10 backdrop-blur-sm border-white/20 text-white flex-shrink-0"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-sm text-white/90 mb-3 leading-relaxed">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-400/30 flex items-center justify-center text-sm font-bold">
                            {review.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{review.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 border-0 text-white p-8 sm:p-12">
            <CardContent className="p-0 space-y-6">
              <h2 className="text-2xl sm:text-4xl font-bold">
                Start Earning Today! 🚀
              </h2>
              <p className="text-emerald-100 text-lg">
                Join with just Rs. 100 fee and start unlimited earning. Invite friends and earn money!
              </p>
              <Button
                size="lg"
                onClick={handleJoin}
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg font-bold px-10 py-6 rounded-xl"
                whileTap={{ scale: 0.95 }}
              >
                Join Now - Only Rs. 100 <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">EarnPro</span>
            </div>
            <p className="text-sm text-center sm:text-right">
              © 2022 EarnPro. All rights reserved. Pakistan&apos;s #1 Referral Platform since 2022.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
