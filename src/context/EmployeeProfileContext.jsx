import { createContext, useContext, useEffect, useState } from 'react'
import logo from '../assets/logo.png'

const ProfileContext = createContext(null)

const defaultProfile = {
  name: 'Juan Dela Cruz',
  email: 'juan.delacruz@mjprints.com',
  role: 'Employee',
  avatar: logo,
}

export function EmployeeProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('mje:profile')
      return stored ? JSON.parse(stored) : defaultProfile
    } catch (error) {
      return defaultProfile
    }
  })

  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('mje:profile', JSON.stringify(profile))
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

export function useEmployeeProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useEmployeeProfile must be used within EmployeeProfileProvider')
  return ctx
}
