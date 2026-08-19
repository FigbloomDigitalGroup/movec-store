import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiTruck, FiCalendar, FiMail, FiArrowRight, FiCreditCard, FiPhone, FiClock } from 'react-icons/fi';
import CheckoutSteps from '../components/CheckoutSteps';
import type { OrderItem } from '../types';

const VERIFY_MAX_ATTEMPTS = 3;
const VERIFY_RETRY_DELAY_MS = 2000;

export default function PaymentPage() {
    const { orderNumber } = useParams();
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyFailed, setVerifyFailed] = useState(false);
    const [paystackReference, setPaystackReference] = useState<string | null>(null);

    const { data: order } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: () => api.get(`/orders/${orderNumber}`).then(r => r.data),
    });

    // Paystack's own verify endpoint is a thin check on top of the payment — the
    // order is only ever actually confirmed by Paystack's webhook hitting our
    // backend directly (HMAC-verified, server-to-server). A single failed verify
    // call here is far more likely to be a transient network hiccup than a real
    // failed payment, so we retry a few times before telling the user anything
    // is wrong — and even then we say "still confirming," not "failed," since
    // the webhook may complete independently moments later.
    const verifyPayment = (reference: string, attempt = 1) => {
        setVerifying(true);
        setVerifyFailed(false);
        api.post('/payments/paystack/verify', { reference })
            .then(() => {
                setVerifying(false);
                setCompleted(true);
            })
            .catch(() => {
                if (attempt < VERIFY_MAX_ATTEMPTS) {
                    setTimeout(() => verifyPayment(reference, attempt + 1), VERIFY_RETRY_DELAY_MS);
                } else {
                    setVerifying(false);
                    setVerifyFailed(true);
                    setProcessing(false);
                }
            });
    };

    const initiatePaystack = useMutation({
        mutationFn: () => api.post('/payments/paystack/initialize', { orderNumber, email: order?.user?.email || 'customer@example.com' }).then(r => r.data),
        onSuccess: (data) => {
            const paystack = new window.PaystackPop();
            paystack.newTransaction({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: order?.user?.email || 'customer@example.com',
                amount: Math.round(Number(order?.total) * 100),
                ref: data.reference,
                onSuccess: (transaction) => {
                    setPaystackReference(transaction.reference);
                    verifyPayment(transaction.reference);
                },
                onCancel: () => {
                    setProcessing(false);
                }
            });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
            setProcessing(false);
        }
    });

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mx-auto mb-6" />
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Confirming your payment...</h1>
                    <p className="text-gray-500 text-sm">This will only take a moment.</p>
                </div>
            </div>
        );
    }

    if (verifyFailed) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiClock className="text-amber-500" size={40} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-section-title mb-2 text-gray-900">Still confirming your payment</h1>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                            We couldn't confirm your payment automatically just now. If you completed the payment,
                            your order will update on its own within a few minutes — this page just couldn't verify
                            it right away. Please don't pay again until you've checked your order status below.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => paystackReference && verifyPayment(paystackReference)}
                                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-medium"
                            >
                                Check Again
                            </button>
                            <Link
                                to={`/orders/${orderNumber}`}
                                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-center flex items-center justify-center gap-2"
                            >
                                View Order Status
                                <FiArrowRight size={16} />
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-8">
                            Still not updated after a few minutes? <Link to="/contact" className="text-primary-500 hover:underline">Contact support</Link> and we'll look into it.
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
                <div className="max-w-3xl mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <FiCheckCircle className="text-green-500" size={40} />
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-section-title text-center mb-2 text-gray-900"
                        >
                            Paystack Payment Initiated!
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-600 text-center mb-8"
                        >
                            Your Paystack payment is being processed. You will receive confirmation shortly.
                        </motion.p>

                        {/* What Happens Next */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-50 rounded-xl p-6 mb-8"
                        >
                            <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiMail className="text-primary-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Confirmation Email</p>
                                        <p className="text-sm text-gray-600">You'll receive an email with your order details and payment confirmation.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiTruck className="text-primary-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Order Processing</p>
                                        <p className="text-sm text-gray-600">Your order will be processed within 1-2 business days.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiCalendar className="text-primary-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Installation Scheduling</p>
                                        <p className="text-sm text-gray-600">For installation orders, our team will contact you to schedule a convenient time.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to={`/orders/${orderNumber}`}
                                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition font-medium text-center flex items-center justify-center gap-2"
                            >
                                View Order
                                <FiArrowRight size={18} />
                            </Link>
                            <Link
                                to="/products"
                                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-center"
                            >
                                Continue Shopping
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <CheckoutSteps currentStep={2} />
            <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-section-title mb-2 text-gray-900">Complete Payment</h1>
            <p className="text-gray-600 mb-8">Order #{orderNumber}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-section-title text-gray-900 mb-4">Choose your payment method</h2>

                    <div className="w-full rounded-2xl border border-primary-500/40 bg-primary-50 p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-lg font-semibold text-gray-900">Supported payment methods</p>
                                <p className="text-sm text-gray-600 mt-1">You'll choose one of the options below in the secure payment window that opens next.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'MPESA', icon: FiPhone, label: 'M-PESA', subtitle: 'Mobile payment' },
                                    { key: 'CARD', icon: FiCreditCard, label: 'Card', subtitle: 'Visa, Mastercard, other cards' },
                                ].map(({ key, icon: Icon, label, subtitle }) => (
                                    <div
                                        key={key}
                                        className="rounded-2xl p-4 border border-gray-200 bg-white text-left flex items-start gap-3"
                                    >
                                        <div className="p-2 rounded-full bg-primary-50 text-primary-500">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{label}</p>
                                            <p className="text-xs text-gray-500">{subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mt-4">
                        <p className="text-gray-700 mb-4">Continue to the secure checkout to complete payment using your preferred method.</p>
                        <button
                            onClick={() => { setProcessing(true); initiatePaystack.mutate(); }}
                            disabled={initiatePaystack.isPending || processing}
                            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition font-semibold disabled:opacity-50"
                        >
                            {(initiatePaystack.isPending || processing) ? 'Loading secure payment...' : 'Continue to Secure Payment'}
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 h-fit sticky top-24">
                    <h2 className="text-xl font-section-title mb-4">Order Summary</h2>
                    {order?.items?.map((item: OrderItem, i: number) => (
                        <div key={i} className="flex justify-between py-2 border-b border-gray-200/30 text-sm">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-gray-600 py-2">
                        <span>Subtotal</span>
                        <span>KES {order?.subtotal?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 py-2">
                        <span>Shipping</span>
                        <span>{order?.shippingCost > 0 ? `KES ${order.shippingCost.toLocaleString()}` : 'Free'}</span>
                    </div>
                    {order?.taxAmount > 0 && (
                        <div className="flex justify-between text-gray-600 py-2">
                            <span>Tax (VAT)</span>
                            <span>KES {order.taxAmount.toLocaleString()}</span>
                        </div>
                    )}
                    {order?.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium py-2">
                            <span>Discount</span>
                            <span>-KES {order.discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-300/40">
                        <span>Total</span>
                        <span>KES {order?.total?.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200/30">
                        <p className="text-sm text-gray-500">Status: <span className="font-semibold text-primary-500">{order?.status}</span></p>
                    </div>
                    <Link to={`/orders/${orderNumber}`} className="block text-center text-primary-500 text-sm mt-4 hover:text-primary-600 hover:underline">
                        View Order Details
                    </Link>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-200/30">
                        <p className="text-xs text-gray-500 mb-3 text-center">Secure Payment</p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <span className="text-xs font-medium text-slate-700">Paystack</span>
                            </div>
                            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <span className="text-xs font-medium text-slate-700">Card & Mobile Money</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">256-bit SSL Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}