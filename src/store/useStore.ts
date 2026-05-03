import { create } from 'zustand'

export type View = 'landing' | 'login' | 'payment' | 'dashboard' | 'admin'

export interface UserData {
  id: string
  name: string
  email: string
  phone: string | null
  referralCode: string
  referredById: string | null
  walletBalance: number
  totalWithdrawn: number
  role: string
  isActive: boolean
  hasPaidFee: boolean
  createdAt: string
}

interface AppState {
  view: View
  user: UserData | null
  token: string | null
  isLoading: boolean
  error: string | null
  success: string | null

  setView: (view: View) => void
  setUser: (user: UserData | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
  logout: () => void
}

export const useStore = create<AppState>((set) => ({
  view: 'landing',
  user: null,
  token: null,
  isLoading: false,
  error: null,
  success: null,

  setView: (view) => set({ view }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, success: null }),
  setSuccess: (success) => set({ success, error: null }),
  logout: () =>
    set({
      view: 'landing',
      user: null,
      token: null,
      error: null,
      success: null,
    }),
}))
