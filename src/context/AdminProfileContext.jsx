import { createContext, useContext, useEffect, useState } from 'react'
import logo from '../assets/logo.png'

const ProfileContext = createContext(null)

const defaultProfile = {
  name: 'Admin MJ',
  email: 'admin@mjprints.com',
  role: 'Administrator',
  avatar: logo,
}

export function AdminProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('mj:profile')
      return stored ? JSON.parse(stored) : defaultProfile
    } catch (error) {
      return defaultProfile
    }
  })

  const [showEditProfile, setShowEditProfile] = useState(false)

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
