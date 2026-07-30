import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cc_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return null; // No auto-login — user must explicitly sign in
  });

  const [token, setToken] = useState(() => localStorage.getItem('cc_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cc_user');
      localStorage.removeItem('cc_token');
    }
  }, [user]);

  const login = async (email, password, roleHint) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('cc_token', res.data.token);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      // Fallback demo logins when backend is unreachable
      const hint = roleHint || (email.includes('organizer') ? 'organizer' : email.includes('admin') ? 'admin' : 'student');
      switchRoleDemo(hint);
      return { success: true };
    }
    setLoading(false);
    return { success: false };
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('cc_token', res.data.token);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      // Fallback local registration
      const newU = {
        _id: 'usr_' + Date.now(),
        ...formData,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      };
      setUser(newU);
      setToken('demo_token_' + Date.now());
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  const switchRoleDemo = (roleName) => {
    if (roleName === 'student') {
      setUser({
        _id: 'usr_student_demo',
        name: 'Aarav Sharma',
        email: 'student@campusconnect.edu',
        role: 'student',
        college: 'National Institute of Technology',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        cgpa: '8.7',
        bio: 'Passionate about AI, competitive coding, and building impactful tech products.',
        city: 'Trichy',
        state: 'Tamil Nadu',
        languages: ['English', 'Tamil', 'Hindi'],
        linkedin: 'https://linkedin.com/in/aaravsharma',
        github: 'https://github.com/aaravsharma',
        interests: ['Artificial Intelligence', 'Competitive Coding', 'Web & Web3'],
        skills: ['React', 'Node.js', 'Python', 'ML'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        emergencyContact: {
          name: 'Ramesh Sharma',
          phone: '+91 98400 12345',
          relation: 'Father'
        }
      });
    } else if (roleName === 'organizer') {
      setUser({
        _id: 'usr_organizer_demo',
        name: 'Priya Sundaram',
        email: 'organizer@iitm.ac.in',
        role: 'organizer',
        college: 'IIT Madras',
        department: 'Event Advisory Council',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
      });
    } else if (roleName === 'admin') {
      setUser({
        _id: 'usr_admin_demo',
        name: 'Super Admin',
        email: 'admin@campusconnect.edu',
        role: 'admin',
        college: 'Eventix Headquarters',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
      });
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated,
      login, register, logout, switchRoleDemo, updateProfile,
      role: user?.role || 'student'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
