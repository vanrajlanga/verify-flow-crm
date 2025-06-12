import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser } from '@/lib/supabase-queries';
import { Shield } from 'lucide-react';
import { User } from '@/utils/mockData';

interface LoginFormProps {
  onLogin: (user: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with email:', email);
      const user = await loginUser(email, password);
      
      if (user) {
        console.log('Login successful for user:', user.name);
        onLogin(user);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/agent/dashboard');
        }
      } else {
        console.log('Login failed - invalid credentials');
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'agent') => {
    setIsLoading(true);
    setError('');
    
    try {
      let email, password;
      if (role === 'admin') {
        email = 'admin@kycverification.com';
        password = 'password';
      } else {
        email = 'rajesh@kycverification.com';
        password = 'password';
      }
      
      console.log('Demo login attempt for:', email);
      const user = await loginUser(email, password);
      
      if (user) {
        console.log('Demo login successful for user:', user.name);
        onLogin(user);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/agent/dashboard');
        }
      } else {
        console.log('Demo login failed');
        setError('Demo login failed. Please try again.');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="bg-primary rounded-full p-3 mb-4">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl text-center">Login to KYC Verification</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Demo Accounts:</h4>
          <div className="space-y-2">
            <div>
              <strong>Admin:</strong><br />
              Email: admin@kycverification.com<br />
              Password: password
            </div>
            <div>
              <strong>Agent:</strong><br />
              Email: rajesh@kycverification.com<br />
              Password: password
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Quick Demo Access
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleDemoLogin('agent')}
            disabled={isLoading}
          >
            Agent Demo
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleDemoLogin('admin')}
            disabled={isLoading}
          >
            Admin Demo
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
