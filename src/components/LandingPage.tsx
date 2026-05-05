'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Wallet,
  UserPlus,
  Link,
  Share2,
  Shield,
  Zap,
  LayoutDashboard,
  BarChart3,
  Check,
  Users,
  Eye,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'
import { useStore } from '@/store/useStore'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.02, y: -4 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 300 }
}

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Trust', href: '#trust' },
]

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up with your details in under a minute', step: '01' },
  { icon: Link, title: 'Get Your Link', desc: 'Receive a unique referral link to share', step: '02' },
  { icon: Share2, title: 'Invite Friends', desc: 'Share with friends via social media or messaging', step: '03' },
  { icon: Wallet, title: 'Earn Rewards', desc: 'Earn Rs. 50 for each friend who joins', step: '04' },
]

const features = [
  { icon: Shield, title: 'Secure System', desc: 'Your data and earnings are protected with industry-standard security measures' },
  { icon: Zap, title: 'Fast Withdrawals', desc: 'Request withdrawals easily once you meet the minimum referral requirement' },
  { icon: LayoutDashboard, title: 'User Dashboard', desc: 'Track your referrals, earnings, and withdrawal history in real time' },
  { icon: BarChart3, title: 'Referral Tracking', desc: 'See exactly who signed up using your link and track your progress' },
]

const trustItems = [
  { title: 'Transparent System', desc: 'No hidden fees, no misleading promises. What you see is what you get.' },
  { title: 'Data Protection', desc: 'Your personal information is safe and never shared with third parties.' },
  { title: 'Real Earnings', desc: 'Earn genuinely through referrals. No fake claims or inflated numbers.' },
]

export default function LandingPage() {
  const { setView } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleGetStarted = () => {
    setView('login')
  }

  const handleLogin = () => {
    setView('login')
  }

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* ==================== NAVBAR ==================== */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 glass border-b border-gray-200/60"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#16a34a] flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#111827] tracking-tight">EarnPro</span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#16a34a] rounded-lg hover:bg-green-50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2.5">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="text-sm font-medium text-gray-600 hover:text-[#111827] hover:bg-gray-100 px-4"
              >
                Login
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium text-sm shadow-sm shadow-green-200 px-5"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4 space-y-1"
            >
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#16a34a] hover:bg-green-50 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 px-4">
                <Button variant="outline" onClick={handleLogin} className="w-full">Login</Button>
                <Button onClick={handleGetStarted} className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white">Get Started</Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-green-50/60 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] leading-[1.1] tracking-tight"
            >
              Earn by Inviting{' '}
              <span className="gradient-text">Friends</span>{' '}
              Easily
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto"
            >
              A simple, transparent referral system. Share your link, invite friends, and earn rewards for each successful referral.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium text-base px-8 py-6 rounded-xl shadow-sm shadow-green-200 h-auto"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo('#how-it-works')}
                className="font-medium text-base px-8 py-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-auto"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">500+</p>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">Rs. 50</p>
                <p className="text-sm text-gray-500">Per Referral</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">Instant Tracking</p>
                <p className="text-sm text-gray-500">Real-time Dashboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-[#f9fafb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 text-lg">Four simple steps to start earning</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative"
          >
            {/* Dotted connector lines (desktop only) */}
            <div className="hidden lg:block absolute top-16 left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-0 dotted-connector" />

            {steps.map((item, i) => (
              <motion.div key={i} variants={fadeInUp} {...scaleOnHover} className="relative z-10">
                <Card className="bg-white border border-gray-200/80 hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-6 sm:p-8 text-center">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-[#16a34a] text-sm font-bold mb-5">
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-[#16a34a] flex items-center justify-center mx-auto mb-5 shadow-sm shadow-green-200">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-[#111827] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="py-20 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Why Choose EarnPro?
            </h2>
            <p className="mt-3 text-gray-500 text-lg">Everything you need for a smooth referral experience</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((item, i) => (
              <motion.div key={i} variants={fadeInUp} {...scaleOnHover}>
                <Card className="bg-white border border-gray-200/80 hover:shadow-lg hover:border-green-200 transition-all duration-300 h-full">
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                      <item.icon className="w-6 h-6 text-[#16a34a]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111827] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== TRUST SECTION ==================== */}
      <section id="trust" className="py-20 sm:py-24 bg-[#f9fafb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Built on Trust &amp; Transparency
            </h2>
            <p className="mt-3 text-gray-500 text-lg">We believe in keeping things honest and open</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-5"
          >
            {trustItems.map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="bg-white border border-gray-200/80 hover:shadow-sm transition-shadow">
                  <CardContent className="p-6 sm:p-8 flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-[#16a34a]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#111827] mb-1.5">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[#16a34a] to-[#15803d] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to Start Earning?
            </h2>
            <p className="mt-4 text-lg text-green-100 max-w-xl mx-auto">
              Join hundreds of users already earning through our referral program.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white hover:bg-gray-50 text-[#16a34a] font-semibold text-base px-8 py-6 rounded-xl shadow-lg h-auto"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#111827] text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
            {/* Brand */}
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center">
                  <Wallet className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">EarnPro</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                A simple and transparent referral platform. Share, invite, and earn rewards.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#how-it-works" className="text-sm text-gray-500 hover:text-white transition-colors">How It Works</a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a>
                </li>
                <li>
                  <button onClick={handleGetStarted} className="text-sm text-gray-500 hover:text-white transition-colors">Dashboard</button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Terms &amp; Conditions</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Contact Us</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-600 text-center">
              &copy; 2025 EarnPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
