import SectionTitle from '@/components/shared/SectionTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        title="Privacy Policy"
        subtitle="Your privacy is important to us. This policy explains how we collect, use, and protect your information."
      />

      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Saleeka Foundation Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h3>1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us, such as when you create an account, fill out a form, or contact us. This may include:
            </p>
            <ul>
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Profile information and preferences</li>
              <li>Communications with us</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Communicate with you about products, services, and events</li>
            </ul>

            <h3>3. Information Sharing</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information:
            </p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist us in operating our platform</li>
            </ul>

            <h3>4. Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h3>5. Your Rights</h3>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and personal information</li>
              <li>Opt out of certain communications</li>
            </ul>

            <h3>6. Cookies and Tracking</h3>
            <p>
              We use cookies and similar tracking technologies to collect and use personal information about you. You can control cookies through your browser settings.
            </p>

            <h3>7. Changes to This Policy</h3>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h3>8. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@saleeka.org.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}