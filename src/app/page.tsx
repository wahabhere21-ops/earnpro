'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import LandingPage from '@/components/LandingPage'
import LoginModal from '@/components/LoginModal'
import PaymentScreen from '@/components/PaymentScreen'
import UserDashboard from '@/components/UserDashboard'
import AdminPanel from '@/components/AdminPanel'

export default function Home() {
  const { view } = useStore()

  useEffect(() => {
    fetch('/api/seed').catch(() => {})
  }, [])

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  }

  return (
    <main>
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <LandingPage />
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div key="login" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <LoginModal />
          </motion.div>
        )}

        {view === 'payment' && (
          <motion.div key="payment" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <PaymentScreen />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <UserDashboard />
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <AdminPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
