// src/pages/auth/ForgotPasswordPage.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sendPasswordResetLink, checkUserExists } from '@/lib/supabase/actions';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AuthCard } from '@/components/shared/AuthCard';
import { Loader2, MailCheck } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First check if user exists
      const { exists } = await checkUserExists(values.email);
      
      if (!exists) {
        toast.error('No account found with this email address.');
        return;
      }

      const { error } = await sendPasswordResetLink(values.email);
      if (error) {
        toast.error(error.message || 'Failed to send reset link.');
      } else {
        setIsSuccess(true);
        toast.success('Password reset link sent! Please check your email.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <MailCheck className="h-16 w-16 mx-auto text-emerald-500" />
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong>{form.getValues("email")}</strong>.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a reset link.</p>
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
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
