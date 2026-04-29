'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useExperience } from '../preferences/ExperienceProvider';

export function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const { t } = useExperience();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-zinc-950">{t('auth.welcomeBack')}</CardTitle>
        <CardDescription>
          {t('auth.signInDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="Enter your email"
            disabled={loading}
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Enter your password"
            disabled={loading}
          />
          
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-800">Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
