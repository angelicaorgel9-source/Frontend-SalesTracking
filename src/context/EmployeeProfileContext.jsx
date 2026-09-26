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
      const savedUser = localStorage.getItem('mje:user')
      const parsedUser = savedUser ? JSON.parse(savedUser) : null

      if (parsedUser) {
        return {
          name: parsedUser.name || parsedUser.username || defaultProfile.name,
          email: parsedUser.email || defaultProfile.email,
          phone: parsedUser.phone || '',
          role: parsedUser.role === 'ADMIN' ? 'Administrator' : 'Employee',
          avatar: defaultProfile.avatar,
        }
      }

      return stored ? JSON.parse(stored) : defaultProfile
    } catch (error) {
      return defaultProfile
    }
  })

  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('mje:user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setProfile((current) => ({
          ...current,
          name: parsedUser.name || parsedUser.username || current.name,
          email: parsedUser.email || current.email,
          phone: parsedUser.phone || current.phone,
          role: parsedUser.role === 'ADMIN' ? 'Administrator' : 'Employee',
        }))
      } catch (error) {
        // ignore parse errors
      }
    }
  }, [])

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
