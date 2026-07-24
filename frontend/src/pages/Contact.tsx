import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import AnimatedContent from '../components/AnimatedContent';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '', // honeypot
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await api.post('/support/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    } catch (err) {
      console.error('Contact form error', err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedContent distance={30} direction="vertical" duration={0.6}>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about Starlink or CCTV installations? We're here to help. Reach out to our team.
          </p>
        </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatedContent distance={40} direction="horizontal" duration={0.6} delay={0.1}>
            <Card>
              <CardBody className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Business Information</h3>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FiMapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Address</h4>
                    <p className="text-gray-600">SMK Business Center, Nairobi, Kenya</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <FiPhone size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone & WhatsApp</h4>
                    <p className="text-gray-600">+254 727 572 310</p>
                    <a href="https://wa.me/254796285718" target="_blank" rel="noopener noreferrer" className="text-green-600 text-sm font-medium hover:underline mt-1 inline-block">
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <FiMail size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">sales@movec.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <FiClock size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Working Hours</h4>
                    <p className="text-gray-600">Mon - Sat: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sun: Closed</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            </AnimatedContent>

            <AnimatedContent distance={40} direction="horizontal" duration={0.6} delay={0.2}>
            <Card className="overflow-hidden">
              <iframe
                title="Google Maps"
                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=SMK%20Business%20Centre,%20Nairobi,%20Kenya&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Card>
            </AnimatedContent>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <AnimatedContent distance={40} direction="vertical" duration={0.6} delay={0.2}>
            <Card>
              <CardBody className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>

                {status === 'success' ? (
                  <div className="bg-green-50 text-green-800 p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-4">
                    <FiCheckCircle size={48} className="text-green-500" />
                    <div>
                      <h4 className="text-xl font-medium mb-2">Message Sent!</h4>
                      <p>Thank you for reaching out. We've received your message and will get back to you shortly.</p>
                    </div>
                    <Button variant="outline" onClick={() => setStatus('idle')}>Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                        <FiAlertCircle size={20} />
                        <span>Failed to send message. Please try again or contact us via WhatsApp.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="+254 796285718"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                        <input
                          type="text"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="Please describe your inquiry in detail..."
                      ></textarea>
                    </div>

                    {/* Honeypot field (hidden from real users) */}
                    <div style={{ display: 'none' }} aria-hidden="true">
                      <label>Don't fill this out if you're human:</label>
                      <input type="text" name="website" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                    </div>

                    <Button type="submit" disabled={status === 'loading'} className="w-full md:w-auto">
                      {status === 'loading' ? 'Sending...' : (
                        <>
                          <FiSend className="mr-2" /> Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
            </AnimatedContent>
          </div>
        </div>
      </div>
    </div>
  );
}