import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const safeGetStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked or unavailable
  }
};

const safeRemoveStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage blocked or unavailable
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = safeGetStorage('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Invalid JSON or storage error — clear it
      safeRemoveStorage('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    safeSetStorage('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    safeRemoveStorage('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
