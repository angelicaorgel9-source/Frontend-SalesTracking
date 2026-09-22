import { createContext, useContext, useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { api } from '../utils/api.js'

const ProfileContext = createContext(null)

const defaultProfile = {
  name: 'Alexander Sterling',
  email: 'alexander@mjprints.co',
  phone: '+63 917 123 4567',
  role: 'Customer',
  avatar: logo,
}

export function CustomerProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('mjc:profile')
      return stored ? JSON.parse(stored) : defaultProfile
    } catch (error) {
      return defaultProfile
    }
  })

  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('mjc:token')) return
    api.getProfile().then((user) => {
      setProfile((current) => ({
        ...current,
        name: user.name || user.username,
        email: user.email,
        phone: user.phone,
        role: 'Customer',
        two_factor_enabled: user.two_factor_enabled,
      }))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('mjc:profile', JSON.stringify(profile))
    } catch (error) {
      // ignore storage errors
    }
  }, [profile])

  const updateProfile = (updates) => {
    setProfile((current) => ({ ...current, ...updates }))
    if (localStorage.getItem('mjc:token')) {
      api.updateProfile({ name: updates.name, phone: updates.phone, two_factor_enabled: updates.two_factor_enabled }).catch(() => {})
    }
  }

  const openEditProfile = () => setShowEditProfile(true)
  const closeEditProfile = () => setShowEditProfile(false)

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, showEditProfile, openEditProfile, closeEditProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useCustomerProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useCustomerProfile must be used within CustomerProfileProvider')
  return ctx
}
