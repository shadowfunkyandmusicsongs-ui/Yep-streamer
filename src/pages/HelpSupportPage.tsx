import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Film,
  Volume2,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Which audio dub tracks are supported?',
      a: 'YEP Streamer provides authentic Telugu Dubbed, Hindi Dubbed, Japanese Original, and English Audio tracks for supported titles. You can select your preferred audio track directly inside the video player HUD or configure your default preference in Settings.',
    },
    {
      q: 'How does the HLS Adaptive Bitrate (ABR) player work?',
      a: 'Our video player utilizes hls.js to seamlessly detect your network connection speed and dynamically switch between 1080p Full HD (4.5 Mbps), 720p HD (2.2 Mbps), and 480p SD (900 kbps) renditions without buffering stops.',
    },
    {
      q: 'How can I upload original anime or film projects?',
      a: 'Creators and studios can switch their account role to Creator in the top menu or through the onboarding portal. The Creator Studio provides multi-bitrate HLS packaging, probe validation, and title publishing.',
    },
    {
      q: 'How do I submit a copyright infringement (DMCA) notice?',
      a: 'We respect intellectual property rights. If you believe your copyrighted work is distributed without authorization, submit a notice through the "Report Content" modal on any video or email our designated agent at dmca@yepstreamer.com with title identification and proof of ownership.',
    },
    {
      q: 'How does Gemini AI Search work?',
      a: 'The Gemini AI assistant grounds its responses exclusively on the verified YEP Streamer catalog. It translates natural requests (e.g. "Exciting sword fights with Telugu audio") into curated title recommendations without fabricating content availability.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-white">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-cyan-400" />
          <span>Help & Support Center</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Frequently asked questions, streaming diagnostics, and copyright agent contact details.
        </p>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 space-y-3">
        <h2 className="text-base font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isOpen && (
                <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support & Legal Contact Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Mail className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Customer Support</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Have questions about streaming quality, account access, or subtitles? Our support team responds within 24 hours.
          </p>
          <a
            href="mailto:support@yepstreamer.com"
            className="text-xs font-mono text-cyan-400 hover:underline"
          >
            support@yepstreamer.com
          </a>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">DMCA & Copyright Agent</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Designated agent under 17 U.S.C. 512(c) for takedown notices and intellectual property inquiries.
          </p>
          <a
            href="mailto:dmca@yepstreamer.com"
            className="text-xs font-mono text-rose-400 hover:underline"
          >
            dmca@yepstreamer.com
          </a>
        </div>
      </div>
    </div>
  );
};
