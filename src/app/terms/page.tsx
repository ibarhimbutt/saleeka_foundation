import SectionTitle from '@/components/shared/SectionTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our platform."
      />

      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Saleeka Foundation Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using the Saleeka Foundation platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3>2. Use License</h3>
            <p>
              Permission is granted to temporarily use the Saleeka Foundation platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the platform</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h3>3. User Accounts</h3>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>

            <h3>4. Privacy Policy</h3>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the platform, to understand our practices.
            </p>

            <h3>5. Prohibited Uses</h3>
            <p>
              You may not use our platform:
            </p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>

            <h3>6. Disclaimer</h3>
            <p>
              The information on this platform is provided on an 'as is' basis. To the fullest extent permitted by law, Saleeka Foundation excludes all representations, warranties, conditions and terms.
            </p>

            <h3>7. Contact Information</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us at info@saleeka.org.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}