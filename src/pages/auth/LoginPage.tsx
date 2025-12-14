// src/pages/auth/LoginPage.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signInWithPassword } from '@/lib/supabase/actions';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AuthCard } from '@/components/shared/AuthCard';

import { Loader2, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await signInWithPassword(values.email, values.password);
      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Please check your email and click the confirmation link before logging in.");
        } else if (error.message.includes('Too many requests')) {
          toast.error("Too many login attempts. Please wait a moment before trying again.");
        } else {
          toast.error(error.message || "Login failed. Please try again.");
        }
      } else {
        toast.success("Welcome back!");
        // The onAuthStateChange listener in AuthContext will handle the redirection automatically.
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to continue your journey.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Password" 
                        {...field} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm space-y-4 mt-6">
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot Password?
          </Link>
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/get-started" className="font-semibold text-primary hover:underline">
              Get Started
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
