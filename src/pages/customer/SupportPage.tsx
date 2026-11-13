import React, { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, Phone, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBazario } from '../../contexts/BazarioContext';

export const SupportPage: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const { language, settings, showToast } = useBazario();
  const [contactMsg, setContactMsg] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const activeTopic = topic ?? 'faq';

  const faqs = [
    {
      qBn: 'ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ কত?',
      qEn: 'What are the delivery charges inside and outside Dhaka?',
      aBn: `ঢাকা শহরে স্ট্যান্ডার্ড ডেলিভারি ৳${settings.deliveryDhakaCharge} এবং ঢাকার বাইরে ৳${settings.deliveryOutsideCharge}। ৳${settings.freeDeliveryThreshold}+ অর্ডারে ফ্রি ডেলিভারি।`,
      aEn: `Standard delivery inside Dhaka is ৳${settings.deliveryDhakaCharge} and outside Dhaka is ৳${settings.deliveryOutsideCharge}. Free standard delivery applies on orders above ৳${settings.freeDeliveryThreshold}.`,
    },
    {
      qBn: 'ক্যাশ অন ডেলিভারি কি সারাদেশে পাওয়া যায়?',
      qEn: 'Is Cash on Delivery available across Bangladesh?',
      aBn: 'হ্যাঁ, বাংলাদেশের সকল ৬৪ জেলায় ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।',
      aEn: 'Yes, Cash on Delivery (COD) is available across all 64 districts of Bangladesh.',
    },
    {
      qBn: 'বিকাশ বা নগদ পেমেন্ট কি আসল?',
      qEn: 'Are bKash, Nagad, or Card payments real here?',
      aBn: 'এটি একটি ডেমো মার্কেটপ্লেস। সকল পেমেন্ট ধাপ শুধুমাত্র প্রদর্শনের জন্য সিমুলেটেড।',
      aEn: 'This is a client presentation demo. All bKash, Nagad, Rocket, and Card flows are simulated.',
    },
    {
      qBn: 'রিটার্ন ও রিফান্ড পলিসি কী?',
      qEn: 'How do returns and refunds work?',
      aBn: 'পণ্য ডেলিভারি পাওয়ার ৭ দিনের মধ্যে অব্যবহৃত অবস্থায় রিটার্ন রিকোয়েস্ট করা যায়।',
      aEn: 'Eligible unused items can be returned within 7 days of delivery with full demo refund tracking.',
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-3 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          { slug: 'faq', bn: 'FAQ', en: 'FAQ' },
          { slug: 'contact', bn: 'যোগাযোগ', en: 'Contact Us' },
          { slug: 'shipping', bn: 'শিপিং পলিসি', en: 'Shipping Policy' },
          { slug: 'returns', bn: 'রিটার্ন ও রিফান্ড', en: 'Returns & Refunds' },
          { slug: 'privacy', bn: 'প্রাইভেসি ও শর্তাবলী', en: 'Privacy & Terms' },
        ].map((tab) => (
          <Link
            key={tab.slug}
            to={`/support/${tab.slug}`}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
              activeTopic === tab.slug
                ? 'bg-[#F85606] text-white border-[#F85606]'
                : 'bg-white text-[#172337] border-[#E5E7EB]'
            }`}
          >
            {language === 'bn' ? tab.bn : tab.en}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6">
        {activeTopic === 'faq' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-[#172337] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#F85606]" />
              <span>{language === 'bn' ? 'সচরাচর জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}</span>
            </h1>
            <div className="divide-y divide-[#E5E7EB]">
              {faqs.map((f, i) => (
                <div key={i} className="py-4">
                  <h2 className="text-sm font-bold text-[#172337]">
                    {language === 'bn' ? f.qBn : f.qEn}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4B5563] mt-1.5 leading-relaxed">
                    {language === 'bn' ? f.aBn : f.aEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTopic === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-[#172337]">
                {language === 'bn' ? 'কাস্টমার সাপোর্ট' : 'BAZARIO Support Desk (Demo)'}
              </h1>
              <p className="text-xs sm:text-sm text-[#4B5563]">{settings.demoNotice}</p>
              <div className="space-y-2.5 text-xs text-[#202124]">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#F85606]" />
                  <span>{settings.supportPhone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#F85606]" />
                  <span>{settings.supportEmail}</span>
                </p>
                <button
                  type="button"
                  onClick={() => showToast(`WhatsApp Support: ${settings.supportPhone}`, 'info')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16A34A] text-white font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Support</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  language === 'bn'
                    ? 'আপনার বার্তা সাপোর্ট টিমের কাছে পৌঁছেছে (ডেমো)।'
                    : 'Demo support inquiry submitted!'
                );
                setContactMsg('');
                setContactEmail('');
              }}
              className="space-y-3"
            >
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-lg"
              />
              <textarea
                required
                rows={4}
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder={
                  language === 'bn' ? 'আপনার প্রশ্ন বা অর্ডার আইডি লিখুন...' : 'Write your message...'
                }
                className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-lg"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
              >
                {language === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
              </button>
            </form>
          </div>
        )}

        {(activeTopic === 'shipping' || activeTopic === 'returns' || activeTopic === 'privacy') && (
          <div className="space-y-3 text-sm text-[#4B5563] leading-relaxed">
            <h1 className="text-xl font-bold text-[#172337] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F85606]" />
              <span className="capitalize">{activeTopic} Policy</span>
            </h1>
            <p>
              {activeTopic === 'shipping'
                ? `BAZARIO fulfills nationwide across Bangladesh. Inside Dhaka delivery is ৳${settings.deliveryDhakaCharge} (1–2 days) and outside Dhaka is ৳${settings.deliveryOutsideCharge} (3–5 days). Orders above ৳${settings.freeDeliveryThreshold} qualify for complimentary standard shipping.`
                : activeTopic === 'returns'
                ? 'Customers may initiate a return within 7 calendar days of delivery for damaged, defective, or incorrect items. Approved demo refunds are processed back to the original wallet or store credit.'
                : 'BAZARIO Demo Marketplace stores session preferences locally in your browser (localStorage) for interactive evaluation. Do not enter real banking or sensitive personal credentials.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
