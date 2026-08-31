import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  loginAdmin, 
  registerAdmin, 
  logoutAdmin, 
  getAdminProfile 
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getAdminProfile(user.uid);
          setAdminProfile(profile);
        } catch (err) {
          console.error("Error fetching admin profile:", err);
        }
      } else {
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getAdminProfile(currentUser.uid);
      setAdminProfile(profile);
    }
  };

  const login = async (email, password) => {
    const res = await loginAdmin(email, password);
    setAdminProfile(res.profile);
    return res;
  };

  const register = async (email, password) => {
    const res = await registerAdmin(email, password);
    setAdminProfile(res.profile);
    return res;
  };

  const logout = async () => {
    await logoutAdmin();
    setAdminProfile(null);
  };

  const value = {
    currentUser,
    adminProfile,
    loading,
    login,
    register,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
