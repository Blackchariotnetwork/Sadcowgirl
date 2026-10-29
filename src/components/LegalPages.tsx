import React from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface LegalPageProps {
  slug: string;
  onBack: () => void;
}

type Doc = { title: string; body: React.ReactNode };

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-varsity text-base font-bold text-white uppercase tracking-wider mt-6 mb-2">{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>
);

const DOCS: Record<string, Doc> = {
  dmca: {
    title: 'DMCA / Copyright Takedown',
    body: (
      <>
        <P>sadcowgirl.fun (&ldquo;the Site&rdquo;) respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (&ldquo;DMCA&rdquo;). We do not host video files on our own servers; videos are embedded from third-party providers.</P>
        <H>Filing a Takedown Notice</H>
        <P>If you believe content available on or through the Site infringes your copyright, send a written notice to our designated agent at <span className="text-[#E07A5F]">dmca@sadcowgirl.fun</span> containing the following:</P>
        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 mb-3">
          <li>Identification of the copyrighted work you claim has been infringed.</li>
          <li>The exact URL(s) on the Site hosting the allegedly infringing material.</li>
          <li>Your full name, mailing address, telephone number, and email address.</li>
          <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on the owner&rsquo;s behalf.</li>
          <li>Your physical or electronic signature.</li>
        </ul>
        <H>Processing</H>
        <P>Valid notices are processed within 48 hours. Content reported via a valid DMCA notice will be removed or disabled promptly, and the affected source provider will be notified where applicable.</P>
        <H>Counter-Notice</H>
        <P>If your content was removed and you believe it was misidentified, you may submit a counter-notice to the same address with equivalent detail under 17 U.S.C. &sect; 512(g).</P>
      </>
    ),
  },
  '2257': {
    title: '18 U.S.C. § 2257 Statement',
    body: (
      <>
        <P>All models, actors, actresses and other persons that appear in any visual portrayal of actual or simulated sexually explicit conduct appearing on, or otherwise contained in, this Website were over the age of eighteen (18) years at the time the visual images were created.</P>
        <H>Exemption Statement</H>
        <P>The Site is not the producer (primary or secondary) of any content found on the Website. With respect to any record-keeping requirements set forth in 18 U.S.C. &sect; 2257, 2257A and/or C.F.R. 75, the Site operates under the following exemption: the operators of this Website are not acting as producers of any content and confine their activities to the transmission, storage, retrieval, hosting and/or formatting of depictions posted by third-party providers, all of whom are assumed to be in full compliance with 18 U.S.C. &sect; 2257.</P>
        <H>Records Inquiries</H>
        <P>Any records required to be maintained pursuant to 18 U.S.C. &sect; 2257 are kept by the corresponding producer of the depictions. Questions regarding specific content may be directed to <span className="text-[#E07A5F]">legal@sadcowgirl.fun</span> and will be forwarded to the responsible producer.</P>
        <H>Age Restricted Access</H>
        <P>This Website contains age-restricted materials including nudity and explicit depictions of sexual activity. By entering, you affirm that you are at least 18 years of age (or the age of majority in the jurisdiction from which you are accessing the Site) and that viewing such material in your community is legal.</P>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    body: (
      <>
        <P>By accessing sadcowgirl.fun (&ldquo;the Site&rdquo;) you agree to these Terms of Service. If you do not agree, you must exit the Site immediately.</P>
        <H>1. Age Requirement</H>
        <P>The Site is strictly limited to adults. You affirm you are at least 18 years old, or the legal age of majority in your jurisdiction, whichever is greater. Any use of the Site by minors is prohibited.</P>
        <H>2. Nature of Service</H>
        <P>The Site is an aggregator and indexer of third-party embedded video content. The Site does not host, upload, produce or own the majority of content displayed. All embedded content remains the responsibility of the respective third-party platform.</P>
        <H>3. Acceptable Use</H>
        <P>You agree not to: (a) use the Site for any unlawful purpose; (b) scrape, spider or systematically extract data; (c) attempt to circumvent access restrictions; (d) upload or transmit malicious code; (e) misrepresent your identity or age.</P>
        <H>4. User Uploads</H>
        <P>Where the Site permits user submissions, you retain ownership of your submissions and grant the Site a worldwide, non-exclusive, royalty-free license to display, distribute and promote such submissions in connection with the Site. You warrant that you hold all necessary rights to submitted material, including model releases and 2257 compliance.</P>
        <H>5. Disclaimer of Warranties</H>
        <P>The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including merchantability and fitness for a particular purpose. We do not warrant uninterrupted or error-free service.</P>
        <H>6. Limitation of Liability</H>
        <P>To the maximum extent permitted by law, the Site&rsquo;s operators shall not be liable for any indirect, incidental, consequential or punitive damages arising from your use of, or inability to use, the Site.</P>
        <H>7. Changes</H>
        <P>We may revise these Terms at any time. Continued use of the Site after changes constitutes acceptance of the revised Terms.</P>
        <H>8. Contact</H>
        <P>Questions regarding these Terms may be sent to <span className="text-[#E07A5F]">legal@sadcowgirl.fun</span>.</P>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    body: (
      <>
        <P>sadcowgirl.fun (&ldquo;the Site&rdquo;) is designed to minimize data collection. This policy explains what little we handle.</P>
        <H>Information We Store</H>
        <P>The Site stores your &ldquo;Lasso List&rdquo; (saved videos) and browsing preferences in your own browser&rsquo;s local storage. This data never leaves your device and is not transmitted to us. Clearing your browser data removes it entirely.</P>
        <H>Analytics &amp; Advertising</H>
        <P>The Site may use privacy-friendly, cookieless analytics and may display third-party advertising. Advertisers and analytics providers may set their own cookies or use similar technologies under their own policies. We do not sell personally identifiable information.</P>
        <H>Embedded Third-Party Content</H>
        <P>Videos are embedded from third-party platforms. When you watch an embedded video, your device communicates directly with that platform, which may log your IP address and set cookies under its own privacy policy.</P>
        <H>Server Logs</H>
        <P>Our hosting provider (Cloudflare) processes standard request data such as IP address and user agent for security and performance purposes. We do not build user profiles from this data.</P>
        <H>Your Rights</H>
        <P>You may request deletion of any personal data we hold by contacting <span className="text-[#E07A5F]">privacy@sadcowgirl.fun</span>. Residents of the EEA, UK and California have additional statutory rights regarding access, correction and erasure.</P>
        <H>Changes</H>
        <P>Material changes to this policy will be posted on this page with an updated effective date.</P>
      </>
    ),
  },
};

export const LegalPage: React.FC<LegalPageProps> = ({ slug, onBack }) => {
  const doc = DOCS[slug];
  if (!doc) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-400 font-mono">Page not found.</p>
        <button onClick={onBack} className="mt-4 text-xs font-mono text-[#E07A5F] hover:underline">Back home</button>
      </div>
    );
  }
  return (
    <div className="py-4 max-w-3xl mx-auto">
      <button onClick={() => { soundFX.playCheerClick(); onBack(); }} className="text-xs font-mono text-slate-400 hover:text-[#E07A5F] flex items-center gap-1 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="bg-[#101726] border border-[#1E293B] rounded-xl p-5 sm:p-8">
        <h2 className="font-varsity text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 pb-4 mb-4 border-b border-[#1E293B]">
          <Scale className="w-6 h-6 text-[#E07A5F]" /> {doc.title}
        </h2>
        <div className="text-[#F3F4F6]">{doc.body}</div>
        <p className="text-[11px] font-mono text-slate-500 mt-8 pt-4 border-t border-[#1E293B]">
          Effective date: October 2026 &middot; sadcowgirl.fun &mdash; operated by Blackchariot Network
        </p>
      </div>
    </div>
  );
};

export const LEGAL_LINKS = [
  { slug: 'terms', label: 'Terms of Service' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'dmca', label: 'DMCA / Copyright' },
  { slug: '2257', label: '18 U.S.C. 2257' },
];

export const NETWORK_LINKS = [
  { name: 'TheGoodLeaks', url: 'https://thegoodleaks.com', tag: 'gamer tube' },
  { name: 'LewdLevel', url: 'https://lewdlevel.com', tag: 'mixed tube' },
  { name: 'AllGoodLeaks', url: 'https://allgoodleaks.com', tag: 'leaks' },
  { name: 'HunterMooreXXX', url: 'https://huntermoorexxx.com', tag: 'leaks' },
  { name: 'ColombianCastingCouch', url: 'https://colombiancastingcouch.com', tag: 'casting' },
];