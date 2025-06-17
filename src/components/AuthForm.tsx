
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Starting auth request...', { isLogin, email: email.substring(0, 3) + '***' });

    try {
      if (isLogin) {
        console.log('Attempting sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Sign in response:', { data: !!data, error: error?.message });

        if (error) {
          console.error('Sign in error:', error);
          
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          console.log('Sign in successful');
          toast({
            title: "Welcome back! 🎉",
            description: "Successfully logged in",
          });
          onSuccess();
        }
      } else {
        if (!validatePassword(password)) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
            variant: "destructive",
          });
          return;
        }

        console.log('Attempting sign up...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log('Sign up response:', { data: !!data, error: error?.message });

        if (error) {
          console.error('Sign up error:', error);
          
          if (error.message.includes('already registered')) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          console.log('Sign up successful');
          toast({
            title: "Account Created! 🎉",
            description: "Your account has been created successfully",
          });
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Unexpected auth error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the authentication service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-8 border border-neon-blue/30 max-w-md w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to continue playing' : 'Join the game'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800/50 border-neon-blue/30 text-white pl-10"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue w-4 h-4" />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800/50 border-neon-blue/30 text-white pl-10 pr-10"
              placeholder={isLogin ? 'Enter password' : 'Create strong password'}
              required
              disabled={loading}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue w-4 h-4" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-neon-blue"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {!isLogin && (
            <p className="text-xs text-gray-400 mt-1">
              Must include: 8+ chars, uppercase, lowercase, number, special character
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold py-3 rounded-lg neon-glow transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </div>
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-neon-blue hover:text-neon-purple transition-colors text-sm"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>

      {/* Connection status indicator */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Connected to Supabase</span>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
