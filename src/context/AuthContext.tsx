import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  phone: string;
  location: string;
  landSize: string;
  primaryCrop: string;
  preferredMandis: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (phone: string, pin: string) => boolean;
  signup: (name: string, phone: string, location: string, primaryCrop: string, pin: string) => boolean;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'रमेश पाटील (Ramesh Patil)',
  phone: '9822154321',
  location: 'कोपरगाव, अहिल्यानगर (Kopargaon)',
  landSize: '5 एकर (5 Acres)',
  primaryCrop: 'Onion',
  preferredMandis: ['Kopargaon', 'Rahata', 'Yeola', 'Sangamner']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('KISAN_SAARTHI_AUTH_USER');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER; // Default logged-in state for instant preview
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('KISAN_SAARTHI_AUTH_USER', JSON.stringify(user));
      } else {
        localStorage.removeItem('KISAN_SAARTHI_AUTH_USER');
      }
    } catch (e) {
      console.warn('Failed to persist auth user:', e);
    }
  }, [user]);

  const login = (phone: string, _pin: string): boolean => {
    // Simple farmer auth validation
    const savedUserStr = localStorage.getItem('KISAN_SAARTHI_REGISTERED_USER_' + phone);
    if (savedUserStr) {
      const parsed = JSON.parse(savedUserStr);
      setUser(parsed);
      return true;
    }
    
    // Default demo login fallback
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      phone: phone || '9822154321'
    };
    setUser(newUser);
    return true;
  };

  const signup = (
    name: string,
    phone: string,
    location: string,
    primaryCrop: string,
    _pin: string
  ): boolean => {
    const newUser: UserProfile = {
      name,
      phone,
      location: location || 'कोपरगाव, अहमदनगर',
      landSize: '4 एकर',
      primaryCrop: primaryCrop || 'Onion',
      preferredMandis: ['Kopargaon', 'Rahata', 'Shrirampur']
    };

    localStorage.setItem('KISAN_SAARTHI_REGISTERED_USER_' + phone, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
