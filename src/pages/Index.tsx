
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from '@/lib/supabase-queries';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('kycUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('User already logged in:', parsedUser.role);
      
      // Redirect based on role
      if (parsedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (parsedUser.role === 'agent') {
        navigate('/agent/dashboard');
      } else if (parsedUser.role === 'tvtteam') { // Fix: Use 'tvtteam' instead of 'tvt'
        navigate('/tvt/dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login for:', email);
      const user = await loginUser(email, password);
      
      if (user) {
        console.log('Login successful for user:', user.name, 'Role:', user.role);
        localStorage.setItem('kycUser', JSON.stringify(user));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`
        });

        // Navigate based on user role
        if (user.role === 'admin') {
          console.log('Redirecting admin to /admin/dashboard');
          navigate('/admin/dashboard');
        } else if (user.role === 'agent') {
          console.log('Redirecting agent to /agent/dashboard');
          navigate('/agent/dashboard');
        } else if (user.role === 'tvtteam') { // Fix: Use 'tvtteam' instead of 'tvt'
          console.log('Redirecting TVT user to /tvt/dashboard');
          navigate('/tvt/dashboard');
        } else {
          console.log('Unknown role, redirecting to admin dashboard');
          navigate('/admin/dashboard');
        }
      } else {
        toast({
          title: "Login Failed", 
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            KYC Verification System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@kycverification.com / password</p>
                <p><strong>Agent:</strong> rajesh@kycverification.com / password</p>
                <p><strong>TVT Team:</strong> mike.tvt@example.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
