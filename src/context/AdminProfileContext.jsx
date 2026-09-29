import { createContext, useContext, useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { api } from '../utils/api.js'

const ProfileContext = createContext(null)

const defaultProfile = {
  name: '',
  email: '',
  role: 'Administrator',
  avatar: logo,
}

export function AdminProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('mj:profile')
      const sessionUser = JSON.parse(localStorage.getItem('mja:user') || 'null')
      return sessionUser ? {
        ...defaultProfile,
        name: sessionUser.name || sessionUser.username,
        email: sessionUser.email,
        role: sessionUser.role === 'ADMIN' ? 'Administrator' : sessionUser.role,
      } : stored ? JSON.parse(stored) : defaultProfile
    } catch (error) {
      return defaultProfile
    }
  })

  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('mja:token')) return
    api.getMyProfile().then((user) => setProfile((current) => ({
      ...current,
      name: user.name || user.username,
      email: user.email,
      role: user.role === 'ADMIN' ? 'Administrator' : user.role,
    }))).catch(() => {})
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('mj:profile', JSON.stringify(profile))
    } catch (error) {
      // ignore storage errors
    }
  }, [profile])

  const updateProfile = (updates) => {
    setProfile((current) => ({ ...current, ...updates }))
  }

  const openEditProfile = () => setShowEditProfile(true)
  const closeEditProfile = () => setShowEditProfile(false)

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, showEditProfile, openEditProfile, closeEditProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useAdminProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useAdminProfile must be used within AdminProfileProvider')
  return ctx
}
