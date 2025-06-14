
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'agent' | 'manager' | 'tvtteam';
  email: string;
  phone: string;
  district: string;
  status: 'Active' | 'Inactive';
  state: string;
  city: string;
  baseLocation: string;
  maxTravelDistance: number;
  extraChargePerKm: number;
  profilePicture: string | null;
  totalVerifications: number;
  completionRate: number;
  password: string;
  documents: any[];
  managedBankId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('kycUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('kycUser');
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Mock login - in real app, this would call an API
    const mockUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Admin User',
        role: 'admin',
        email: 'admin@kycverification.com',
        phone: '+91-9876543210',
        district: 'Bangalore Urban',
        status: 'Active',
        state: 'Karnataka',
        city: 'Bangalore',
        baseLocation: 'Bangalore',
        maxTravelDistance: 50,
        extraChargePerKm: 10,
        profilePicture: null,
        totalVerifications: 0,
        completionRate: 100,
        password: 'password',
        documents: [],
        managedBankId: ''
      },
      {
        id: 'agent-1',
        name: 'Rajesh Kumar',
        role: 'agent',
        email: 'rajesh@kycverification.com',
        phone: '+91-9876543211',
        district: 'Bangalore Urban',
        status: 'Active',
        state: 'Karnataka',
        city: 'Bangalore',
        baseLocation: 'Bangalore',
        maxTravelDistance: 30,
        extraChargePerKm: 8,
        profilePicture: null,
        totalVerifications: 25,
        completionRate: 95,
        password: 'password',
        documents: [],
        managedBankId: ''
      },
      {
        id: 'tvt-1',
        name: 'Atul Sharma',
        role: 'tvtteam',
        email: 'atul@gmail.com',
        phone: '+91-9876543212',
        district: 'Delhi',
        status: 'Active',
        state: 'Delhi',
        city: 'New Delhi',
        baseLocation: 'Delhi',
        maxTravelDistance: 25,
        extraChargePerKm: 12,
        profilePicture: null,
        totalVerifications: 15,
        completionRate: 98,
        password: '123456',
        documents: [],
        managedBankId: ''
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('kycUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kycUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
