// src/pages/auth/SelectRolePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Dumbbell } from "lucide-react";

export default function SelectRolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"customer" | "coach" | null>(null);

  if (!user) {
    return null;
  }

  const handleSelectRole = async (role: "customer" | "coach") => {
    try {
      setLoading(role);

      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user.id);

      if (error) {
        console.error("Role update error:", error);
        alert("Something went wrong. Please try again.");
        return;
      }

      if (role === "customer") {
        navigate("/onboarding/step-1", { replace: true });
      } else {
        navigate("/coach/onboarding", { replace: true });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to TrainWise</h1>
          <p className="text-muted-foreground">
            Tell us how you want to use the platform
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition border"
            onClick={() => handleSelectRole("customer")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">I am a Customer</h2>
                <p className="text-sm text-muted-foreground">
                  I want personalized training plans and daily tasks
                </p>
              </div>
              <Button
                className="w-full"
                disabled={loading !== null}
                loading={loading === "customer"}
              >
                Continue as Customer
              </Button>
            </div>
          </Card>

          {/* Coach */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition border"
            onClick={() => handleSelectRole("coach")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">I am a Coach</h2>
                <p className="text-sm text-muted-foreground">
                  I want to coach clients and create programs
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={loading !== null}
                loading={loading === "coach"}
              >
                Continue as Coach
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
