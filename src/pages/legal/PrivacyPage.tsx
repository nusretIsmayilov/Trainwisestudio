import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
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
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: December 2024</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information you provide directly to us and information we obtain automatically when you use our services:
              </p>
              
              <h3 className="text-lg font-medium mb-3 text-foreground">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Account information (name, email, password)</li>
                <li>Profile details (age, gender, fitness goals, health conditions)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communication preferences and contact details</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 text-foreground">Health and Fitness Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Workout performance and progress tracking</li>
                <li>Nutrition logs and dietary preferences</li>
                <li>Mental health check-ins and mood tracking</li>
                <li>Photos and measurements (only if you choose to share)</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 text-foreground">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage patterns and feature interactions</li>
                <li>Performance data and error reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information to provide, improve, and personalize our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Create and customize your fitness, nutrition, and mental health programs</li>
                <li>Track your progress and provide insights</li>
                <li>Enable coach communication and feedback</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important updates and notifications</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">3. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in limited circumstances:
              </p>
              
              <h3 className="text-lg font-medium mb-3 text-foreground">With Your Consent</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We share information when you explicitly consent, such as with your assigned coach for personalized guidance.
              </p>

              <h3 className="text-lg font-medium mb-3 text-foreground">Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Payment processors for secure transaction handling</li>
                <li>Cloud storage providers for data hosting</li>
                <li>Analytics services for platform improvement</li>
                <li>Customer support tools for assistance</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 text-foreground">Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose information if required by law, legal process, or to protect the rights, property, or safety of TrainWiseStudio, our users, or others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure payment processing through certified providers</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">5. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have several rights regarding your personal information:
              </p>
              
              <h3 className="text-lg font-medium mb-3 text-foreground">Access and Updates</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>View and update your profile information anytime</li>
                <li>Request a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 text-foreground">Data Control</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Control what information you share with coaches</li>
                <li>Manage notification preferences</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 text-foreground">Data Portability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Request an export of your data in a machine-readable format to transfer to another service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal compliance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">8. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Remember your login and preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and features</li>
                <li>Ensure platform security</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any material changes by email or through our platform. Your continued use of our services after changes become effective constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-foreground font-medium">TrainWiseStudio Privacy Team</p>
                <p className="text-muted-foreground">Email: privacy@trainwisestudio.com</p>
                <p className="text-muted-foreground">Address: [Your Business Address]</p>
                <p className="text-muted-foreground">Phone: [Your Contact Number]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;