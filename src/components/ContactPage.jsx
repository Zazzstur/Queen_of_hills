import React, { useState } from 'react';
import { contactService } from '../services/contactService';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
    };

    if (!payload.name || !payload.phone || !payload.email || !payload.message) {
      setSubmitError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await contactService.createContactMessage(payload);
      if (error) {
        throw error;
      }
      setSubmitSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setSubmitError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600">
            Send us a message and we’ll get back to you.
          </p>
        </header>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {submitError ? (
            <div className="mb-6 rounded-lg bg-red-50 text-red-700 px-4 py-3">
              {submitError}
            </div>
          ) : null}
          {submitSuccess ? (
            <div className="mb-6 rounded-lg bg-green-50 text-green-700 px-4 py-3">
              Message sent successfully.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="+91 8170848914"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="toilsdarjeeling@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="Write your message..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-accent text-white px-6 py-3 font-medium hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
