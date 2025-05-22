import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { User } from '@/utils/mockData';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('kycUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      
      // Redirect to appropriate dashboard
      if (parsedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/agent');
      }
    }
  }, [navigate]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('kycUser', JSON.stringify(user));
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="bg-white border-b px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <img src="https://theeclipso.com/wp-content/uploads/2025/03/the-eclipso-black-logo.png" alt="Bank Verification CRM" className="h-10 w-auto" />
            <h1 className="text-lg font-bold">Bank Verification CRM</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row px-4 py-12 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center pr-0 md:pr-12 mb-8 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Streamline Your 
            <span className="text-accent"> KYC </span>
            Verification Process
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            A comprehensive platform for banks and verification agents to manage the KYC verification pipeline efficiently and securely.
          </p>
          <ul className="space-y-4">
            {[
              "Field verification management for banks",
              "Auto-assignment of verification agents",
              "Document collection and validation",
              "Real-time tracking and reporting",
              "End-to-end verification workflow"
            ].map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="bg-accent/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-accent"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <LoginForm onLogin={handleLogin} />
        </div>
      </main>

      <footer className="bg-white border-t px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            &copy; 2025 Bank Verification CRM. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-accent">Privacy Policy</a>
            <a href="#" className="hover:text-accent">Terms of Service</a>
            <a href="#" className="hover:text-accent">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
