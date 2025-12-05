import { AppHeader } from '../components/layout/AppHeader';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-deep text-ocean-50 page-enter">
      <AppHeader showLogo showUserMenu sticky={false} />

      <main className="max-w-3xl mx-auto p-8">
        <div className="bg-deep-surface border border-ocean-800 rounded-xl p-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-ocean-100 mb-6">Privacy Policy for InFluence</h2>
            
            <p className="text-ocean-300 mb-6">
              <strong>Last Updated: November 30, 2025</strong>
            </p>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">1. Introduction</h3>
                <p className="text-ocean-300 leading-relaxed">
                  InFluence ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">2. Information We Collect</h3>
                <p className="text-ocean-300 mb-3">We collect information you provide directly to us, such as:</p>
                <ul className="list-disc list-inside text-ocean-300 space-y-2 ml-2">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information (avatar, display name)</li>
                  <li>Family tree data (genogram information)</li>
                  <li>Usage data and analytics</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">3. How We Use Your Information</h3>
                <p className="text-ocean-300 mb-3">We use your information to:</p>
                <ul className="list-disc list-inside text-ocean-300 space-y-2 ml-2">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Email you regarding your account</li>
                  <li>Fulfill and manage your requests</li>
                  <li>Generate and analyze usage statistics</li>
                  <li>Improve our services and user experience</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Detect, prevent, and address fraud and security issues</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">4. Data Security</h3>
                <p className="text-ocean-300 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">5. Third-Party Services</h3>
                <p className="text-ocean-300 mb-3">
                  We use third-party services, including:
                </p>
                <ul className="list-disc list-inside text-ocean-300 space-y-2 ml-2">
                  <li>Firebase for authentication and data storage</li>
                  <li>Google Gemini AI for analysis features</li>
                  <li>Analytics providers for usage tracking</li>
                </ul>
                <p className="text-ocean-300 mt-3">
                  These third parties may collect information subject to their own privacy policies.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">6. Your Rights</h3>
                <p className="text-ocean-300 mb-3">You have the right to:</p>
                <ul className="list-disc list-inside text-ocean-300 space-y-2 ml-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of certain data uses</li>
                  <li>Download your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">7. Cookies and Tracking</h3>
                <p className="text-ocean-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">8. Data Retention</h3>
                <p className="text-ocean-300 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your data at any time.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">9. Contact Us</h3>
                <p className="text-ocean-300 leading-relaxed">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us at: <strong>privacy@influence.app</strong>
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-ocean-100 mb-3">10. Policy Changes</h3>
                <p className="text-ocean-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through prominent notice on our application.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
