import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Simple approach: use browser history or go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
          <p className="text-muted-foreground mt-2">Last updated: December 2024</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using TrainWiseStudio's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TrainWiseStudio provides personalized fitness, nutrition, and mental health programs through our digital platform. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Customized workout programs and exercise guidance</li>
                <li>Nutritional planning and recipe recommendations</li>
                <li>Mental health and wellness activities</li>
                <li>Progress tracking and analytics</li>
                <li>Coach support and feedback</li>
                <li>Educational content and resources</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">3. User Accounts and Registration</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access our services, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Updating your information to keep it accurate and current</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">4. Subscriptions and Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our services are offered through various subscription plans:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>Fees are charged in advance on a recurring basis</li>
                <li>Refunds are handled according to our refund policy</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>You may cancel your subscription at any time through your account settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">5. Health and Safety Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Important:</strong> Our fitness and nutrition programs are for educational purposes only and should not replace professional medical advice. Before starting any exercise or nutrition program:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Consult with your healthcare provider</li>
                <li>Consider your physical limitations and health conditions</li>
                <li>Stop immediately if you experience pain or discomfort</li>
                <li>Use proper form and equipment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, including but not limited to text, graphics, images, videos, audio, software, and design, is owned by TrainWiseStudio and protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">7. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Share your account credentials with others</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the service</li>
                <li>Upload harmful, offensive, or inappropriate content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TrainWiseStudio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or in connection with your use of our services, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to our services immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason in our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-foreground font-medium">TrainWiseStudio Support</p>
                <p className="text-muted-foreground">Email: legal@trainwisestudio.com</p>
                <p className="text-muted-foreground">Address: [Your Business Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;