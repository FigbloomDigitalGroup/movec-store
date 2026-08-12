import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiTruck, FiCalendar, FiMail, FiArrowRight } from 'react-icons/fi';

export default function PaymentPage() {
    const { orderNumber } = useParams();
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const { data: order } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: () => api.get(`/orders/${orderNumber}`).then(r => r.data),
    });

    const initiatePaystack = useMutation({
        mutationFn: () => api.post('/payments/paystack/initialize', { orderNumber, email: order?.user?.email || 'customer@example.com' }).then(r => r.data),
        onSuccess: (data) => {
            const paystack = new (window as any).PaystackPop();
            paystack.newTransaction({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: order?.user?.email || 'customer@example.com',
                amount: Math.round(Number(order?.total) * 100),
                ref: data.reference,
                onSuccess: (transaction: any) => {
                    api.post('/payments/paystack/verify', { reference: transaction.reference }).then(() => {
                        setCompleted(true);
                    }).catch(() => {
                        setCompleted(true);
                    });
                },
                onCancel: () => {
                    setProcessing(false);
                }
            });
        },
        onError: (err: any) => {
            toast.error(getErrorMessage(err));
            setProcessing(false);
        }
    });

    if (completed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
                            className="text-3xl font-bold text-center mb-2 text-gray-900"
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
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiMail className="text-blue-600" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Confirmation Email</p>
                                        <p className="text-sm text-gray-600">You'll receive an email with your order details and payment confirmation.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiTruck className="text-green-600" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Order Processing</p>
                                        <p className="text-sm text-gray-600">Your order will be processed within 1-2 business days.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiCalendar className="text-purple-600" size={16} />
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
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-center flex items-center justify-center gap-2"
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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Complete Payment</h1>
            <p className="text-gray-300 mb-8">Order #{orderNumber}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Pay with Paystack</h2>

                    <div className="w-full text-left p-4 rounded-xl border-2 border-purple-500 bg-purple-50">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-white">
                                <img src="/visa-gold-800x450.png" alt="Visa/Mastercard" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg text-gray-900">Paystack</p>
                                <p className="text-sm text-gray-600">Secure card payments and local gateways via Paystack</p>
                            </div>
                        </div>
                    </div>

                    {/* Paystack action */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mt-4">
                        <p className="text-gray-700 mb-4">Paystack supports cards, mobile money, and local payment options via a single payment flow.</p>
                        <button
                            onClick={() => { setProcessing(true); initiatePaystack.mutate(); }}
                            disabled={initiatePaystack.isPending || processing}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
                        >
                            {(initiatePaystack.isPending || processing) ? 'Loading secure payment...' : 'Proceed with Paystack'}
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 h-fit sticky top-24">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    {order?.items?.map((item: any, i: number) => (
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
                    <div className="text-xs text-gray-500 mt-3">
                        Calculation: KES {order?.subtotal?.toLocaleString() ?? '0'} + KES {order?.shippingCost?.toLocaleString() ?? '0'} + KES {order?.taxAmount?.toLocaleString() ?? '0'} - KES {order?.discountAmount?.toLocaleString() ?? '0'} = KES {order?.total?.toLocaleString() ?? '0'}
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-300/40">
                        <span>Total</span>
                        <span>KES {order?.total?.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200/30">
                        <p className="text-sm text-gray-500">Status: <span className="font-semibold text-blue-600">{order?.status}</span></p>
                    </div>
                    <Link to={`/orders/${orderNumber}`} className="block text-center text-blue-600 text-sm mt-4 hover:underline">
                        View Order Details
                    </Link>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-200/30">
                        <p className="text-xs text-gray-500 mb-3 text-center">Secure Payment</p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                                <span className="text-xs font-medium text-purple-700">Paystack</span>
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
    );
}