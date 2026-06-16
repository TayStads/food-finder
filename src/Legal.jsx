import { X } from 'lucide-react';

const TERMS = `
TERMS AND CONDITIONS

Last updated: 1 June 2026

1. ACCEPTANCE OF TERMS
By creating an account or using Pantry to Plate ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.

2. DESCRIPTION OF SERVICE
Pantry to Plate is a web-based application that helps users discover recipes based on available ingredients. Paid subscribers gain access to a personal recipe repository where they may store and manage their own recipes.

3. USER ACCOUNTS
You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your password and for all activity under your account. Notify us immediately of any unauthorised use at support@pantrytoplate.co.za.

4. SUBSCRIPTION PLANS AND BILLING
Pantry to Plate offers the following plans:
- Free: Access to all 15 built-in recipes, ingredient matching, and step-by-step guides. No custom recipe features.
- Monthly Plan: R45/month, billed monthly until cancelled. Includes full feature access and unlimited personal recipes.
- Annual Plan: R399 billed once per year. Includes full feature access and unlimited personal recipes. Saves 26% versus the Monthly Plan.
- Beta: Complimentary full access granted to selected testers by the Pantry to Plate team. Not available for self-registration.

Paid plans (Monthly and Annual) include a 7-day free trial. No payment is required during the trial period. If you do not activate a paid plan before your trial ends, access to paid features will be suspended until payment is completed.

All payments are processed securely by PayFast. By subscribing to a paid plan, you authorise Pantry to Plate to charge your chosen payment method on a recurring basis (where applicable).

5. CANCELLATION AND REFUNDS
You may cancel a recurring subscription at any time via the "Manage Account" section. Cancellation takes effect at the end of the current billing period. No partial refunds are issued for unused portions of a billing period. Once-off Annual Plan payments are non-refundable after 7 days from the date of purchase.

6. USER-GENERATED CONTENT
You retain ownership of any custom recipes you add to the Service. By adding content, you grant Pantry to Plate a non-exclusive licence to store and display that content for the purpose of providing the Service to you. We do not share your private recipes with other users without your consent.

7. ACCEPTABLE USE
You agree not to use the Service to upload unlawful, harmful, or infringing content; to attempt to gain unauthorised access to our systems; or to resell or redistribute the Service without written permission.

8. INTELLECTUAL PROPERTY
All built-in content, branding, design, and software of Pantry to Plate are the property of Pantry to Plate and are protected under applicable intellectual property laws. You may not copy or reproduce any part of the Service without written permission.

9. DISCLAIMER OF WARRANTIES
The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted or error-free.

10. LIMITATION OF LIABILITY
To the maximum extent permitted by South African law, Pantry to Plate shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.

11. GOVERNING LAW
These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the South African courts.

12. CHANGES TO TERMS
We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.

13. CONTACT
For any queries regarding these Terms, contact us at support@pantrytoplate.co.za.
`.trim();

const PRIVACY = `
PRIVACY POLICY

Last updated: 1 June 2026

Pantry to Plate is committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and applicable data protection principles.

1. WHO WE ARE
Pantry to Plate ("we", "us") is the responsible party for personal information collected through this Service. Contact: support@pantrytoplate.co.za.

2. INFORMATION WE COLLECT
- Account information: your name and email address, collected when you register.
- User-generated content: custom recipes you choose to save.
- Payment information: processed exclusively by PayFast. We do not store your card or banking details.
- Usage data: basic technical data (browser type, access times) collected automatically for Service improvement.

3. HOW WE USE YOUR INFORMATION
- To create and manage your account.
- To provide and improve the Service.
- To send transactional emails (account confirmation, password reset).
- To process subscription payments via PayFast.
We will not sell, rent, or share your personal information with third parties for marketing purposes.

4. LEGAL BASIS FOR PROCESSING (POPIA)
We process your personal information on the basis of:
- Your consent (account registration and subscription).
- Performance of a contract (providing the Service you subscribed to).
- Legitimate interest (improving and securing the Service).

5. THIRD-PARTY SERVICES
- Supabase (supabase.com): stores your account data and recipes securely.
- PayFast (payfast.co.za): processes subscription payments. Their privacy policy applies to payment data.
We ensure that third-party processors maintain appropriate security standards.

6. DATA RETENTION
We retain your personal information for as long as your account is active. Upon account deletion, your personal data and custom recipes are permanently removed within 30 days.

7. YOUR RIGHTS UNDER POPIA
You have the right to:
- Access the personal information we hold about you.
- Request correction of inaccurate information.
- Request deletion of your personal information ("right to erasure").
- Object to the processing of your personal information.
- Lodge a complaint with the Information Regulator of South Africa (inforegulator.org.za).
To exercise any of these rights, contact us at support@pantrytoplate.co.za.

8. SECURITY
We use industry-standard security measures including encrypted data transmission (HTTPS) and secure cloud storage. While we take reasonable steps to protect your data, no method of transmission over the internet is 100% secure.

9. COOKIES
Pantry to Plate uses essential session cookies to maintain your login state. We do not use advertising or tracking cookies.

10. CHILDREN
The Service is not directed at children under 18. We do not knowingly collect personal information from minors.

11. CHANGES TO THIS POLICY
We may update this Privacy Policy periodically. We will notify you of material changes via email or a notice within the Service.

12. CONTACT AND COMPLAINTS
For data-related queries or complaints: support@pantrytoplate.co.za.
Information Regulator (South Africa): inforegulator.org.za | complaints.IR@justice.gov.za.
`.trim();

export default function Legal({ doc, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-serif font-semibold text-stone-800">
            {doc === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <pre className="text-xs text-stone-600 whitespace-pre-wrap font-sans leading-relaxed">
            {doc === 'terms' ? TERMS : PRIVACY}
          </pre>
        </div>
      </div>
    </div>
  );
}
