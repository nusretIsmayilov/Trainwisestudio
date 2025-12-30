// src/pages/auth/GetStartedPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendMagicLink, checkUserExists } from "@/lib/supabase/actions";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthCard } from "@/components/shared/AuthCard";

import { Loader2, MailCheck } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

const GetStartedPage = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First check if user already exists
      const { exists, user } = await checkUserExists(values.email);

      if (exists) {
        // Show user exists UI instead of just toast
        setUserExists(true);
        setExistingUserEmail(values.email);
        return;
      }

      const { error } = await sendMagicLink(values.email);
      if (error) {
        // Handle specific error cases
        if (error.message.includes("Invalid email")) {
          toast.error("Please enter a valid email address.");
        } else if (error.message.includes("Too many requests")) {
          toast.error(
            "Too many requests. Please wait a moment before trying again."
          );
        } else if (error.message.includes("Email rate limit exceeded")) {
          toast.error(
            "Please wait a few minutes before requesting another magic link."
          );
        } else {
          toast.error(
            error.message || "Failed to send magic link. Please try again."
          );
        }
      } else {
        setIsSuccess(true);
        toast.success("Check your email for your magic link!");
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (userExists) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="h-16 w-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold">Account Already Exists</h1>
            <p className="text-muted-foreground">
              An account with <strong>{existingUserEmail}</strong> already
              exists.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/login")} className="w-full">
                Log In Instead
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/forgot-password")}
                className="w-full"
              >
                Reset Password
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setUserExists(false);
                  setExistingUserEmail("");
                  form.reset();
                }}
                className="w-full"
              >
                Use Different Email
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <MailCheck className="h-16 w-16 mx-auto text-emerald-500" />
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a magic link to{" "}
              <strong>{form.getValues("email")}</strong>. Click it to continue.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
                setIsSuccess(false);
              }}
              className="w-full"
            >
              Use a different email
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Join TrainWiseStudio</h1>
          <p className="text-muted-foreground">
            Enter your email to get started.
          </p>
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
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue with Email
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default GetStartedPage;
