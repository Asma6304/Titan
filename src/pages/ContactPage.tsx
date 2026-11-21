import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MessageSquare, Send } from 'lucide-react';
import { titanApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await titanApi.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setTicketId(res.ticketId);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      showToast('Inquiry submitted', { description: res.message, tone: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Support &amp; Partnerships
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Contact TITAN
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#C7CEEA] sm:text-base">
            Questions about Enterprise licensing, custom team onboarding, or submitting your digital products? Send us a message.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl titan-glass p-6">
              <Mail className="h-5 w-5 text-[#A855F7]" />
              <h2 className="mt-4 font-display text-base font-semibold text-white">Direct Email</h2>
              <p className="mt-1 text-sm text-[#C7CEEA]">support@titanmarketplace.example</p>
            </div>
            <div className="rounded-2xl titan-glass p-6">
              <Clock className="h-5 w-5 text-[#22D3EE]" />
              <h2 className="mt-4 font-display text-base font-semibold text-white">Response Hours</h2>
              <p className="mt-1 text-sm text-[#C7CEEA]">
                Monday – Friday, 09:00 to 18:00 UTC. Average reply under 4 business hours.
              </p>
            </div>
            <div className="rounded-2xl titan-glass p-6">
              <MessageSquare className="h-5 w-5 text-[#22D3EE]" />
              <h2 className="mt-4 font-display text-base font-semibold text-white">Enterprise Licensing</h2>
              <p className="mt-1 text-sm text-[#C7CEEA]">
                Need multi-seat invoicing or custom procurement documentation? Mention your seat count in your message.
              </p>
            </div>
          </div>

          <div className="rounded-2xl titan-glass-elevated p-6 sm:p-8 lg:col-span-8">
            {ticketId ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <h2 className="mt-4 font-display text-2xl font-bold text-white">Message Received</h2>
                <p className="mt-2 text-sm text-[#C7CEEA]">
                  Reference ID: <code className="font-mono text-[#22D3EE]">{ticketId}</code>. Our team will follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketId(null)}
                  className="mt-6 rounded-xl border border-violet-300/25 bg-white/6 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/12 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-[#C7CEEA]">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Taylor Reed"
                      className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-[#C7CEEA]">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="taylor@studio.com"
                      className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-medium text-[#C7CEEA]">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enterprise license inquiry"
                    className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-[#C7CEEA]">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    minLength={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share how our team can help..."
                    className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white titan-glow-button disabled:opacity-60 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
