import { createContext, useContext, useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { api } from '../utils/api.js'

const ProfileContext = createContext(null)

const defaultProfile = {
  name: '',
  email: '',
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
          branch_name: parsedUser.branch_name || '',
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
    if (!localStorage.getItem('mje:token')) return
    api.getMyProfile().then((user) => setProfile((current) => ({
      ...current,
      name: user.name || user.username,
      email: user.email,
      phone: user.phone || '',
      branch_name: user.branch_name || '',
      role: user.role === 'ADMIN' ? 'Administrator' : 'Employee',
    }))).catch(() => {})
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
