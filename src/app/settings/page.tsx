'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { registerAdmin } = useAuth();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const result = await registerAdmin(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(result.message || 'Admin registered successfully');
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || 'Failed to create admin');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure portal credentials and manage system administrator profiles.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-start gap-4 pb-4">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary mt-1">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Security & Credentials</CardTitle>
            <CardDescription>
              Create additional system administrators. Admin accounts have full read/write privileges over staff records and clinical logs.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Admin Full Name
              </label>
              <Input
                placeholder="Dr. Gregory House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="gregory@doctortracker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <span className="text-[10px] text-muted-foreground block">
                Must be at least 6 characters long
              </span>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Create Administrator</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
