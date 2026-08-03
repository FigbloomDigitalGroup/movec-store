import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import api from '../lib/api';
import { FiCreditCard, FiPhone, FiDollarSign, FiCheckCircle, FiCopy, FiTruck, FiCalendar, FiMail, FiArrowRight } from 'react-icons/fi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export default function PaymentPage() {
    const { orderNumber } = useParams();
    const [method, setMethod] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('+254');
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const { data: order } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: () => api.get(`/orders/${orderNumber}`).then(r => r.data),
    });

    const initiateBankTransfer = useMutation({
        mutationFn: () => api.post('/payments/bank-transfer/initiate', { orderNumber }),
        onSuccess: () => {
            setCompleted(true);
        },
    });

    const initiateMpesa = useMutation({
        mutationFn: () => api.post('/payments/mpesa/initiate', { orderNumber, phoneNumber }),
        onSuccess: () => {
            setCompleted(true);
        },
        onError: (err: any) => {
            alert(err.response?.data?.error?.message || 'M-Pesa payment failed. Please try again.');
        },
    });

    const initiateStripe = useMutation({
        mutationFn: () => api.post('/payments/stripe/create-intent', { orderNumber }).then(r => r.data),
        onSuccess: (data) => {
            setClientSecret(data.clientSecret);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to initialize Stripe');
        }
    });

    const initiatePaypal = useMutation({
        mutationFn: () => api.post('/payments/paypal/create-order', { orderNumber }).then(r => r.data),
        onSuccess: (data) => {
            if (data.approvalUrl) {
                window.location.href = data.approvalUrl;
            }
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to initialize PayPal');
            setProcessing(false);
        }
    });

    const capturePaypal = useMutation({
        mutationFn: (token: string) => api.post('/payments/paypal/capture', { orderNumber, token }).then(r => r.data),
        onSuccess: () => {
            setProcessing(false);
            setCompleted(true);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to capture PayPal payment');
            setProcessing(false);
        }
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('paypal') === 'return') {
            const token = params.get('token');
            if (token) {
                setMethod('PAYPAL');
                setProcessing(true);
                capturePaypal.mutate(token);
            }
        }
    }, [orderNumber]);

    const bankDetails = {
        bankName: 'NCBA Bank',
        accountName: 'Movec Store Ltd',
        accountNumber: '1234567890',
        branch: 'Nairobi CBD',
    };

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
                            {method === 'BANK_TRANSFER' ? 'Payment Instructions' : 'Payment Initiated!'}
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-600 text-center mb-8"
                        >
                            {method === 'BANK_TRANSFER'
                                ? 'Please complete the transfer using the details below. Your order will be confirmed once payment is received.'
                                : 'Your payment is being processed. You will receive a confirmation shortly.'}
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
                {/* Payment Methods */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Select Payment Method</h2>

                    {/* M-Pesa */}
                    <button
                        onClick={() => setMethod('MPESA')}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${method === 'MPESA' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white backdrop-blur-sm hover:border-green-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <img src="/image.png" alt="M-Pesa" className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg text-gray-900">M-Pesa</p>
                                <p className="text-sm text-gray-600">Pay via STK Push</p>
                            </div>
                        </div>
                    </button>

                    {/* Stripe */}
                    <button
                        onClick={() => setMethod('STRIPE')}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${method === 'STRIPE' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <img src="/visa-gold-800x450.png" alt="Visa" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">Credit/Debit Card</p>
                                <p className="text-sm text-gray-500">Pay securely via Stripe</p>
                            </div>
                        </div>
                    </button>

                    {/* PayPal */}
                    <button
                        onClick={() => setMethod('PAYPAL')}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${method === 'PAYPAL' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <img src="/paypal_PNG22.png" alt="PayPal" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">PayPal</p>
                                <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                            </div>
                        </div>
                    </button>

                    {/* Bank Transfer */}
                    <button
                        onClick={() => setMethod('BANK_TRANSFER')}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${method === 'BANK_TRANSFER' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-orange-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">Bank Transfer</p>
                                <p className="text-sm text-gray-500">Transfer directly to our bank account</p>
                            </div>
                        </div>
                    </button>

                    {/* Method-specific actions */}
                    {method && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mt-4">
                            {method === 'MPESA' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+254712345678"
                                        className="border rounded-lg px-4 py-3 w-full text-lg"
                                    />
                                    <button
                                        onClick={() => { setProcessing(true); initiateMpesa.mutate(); }}
                                        disabled={processing}
                                        className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                                    >
                                        {processing ? 'Sending STK Push...' : 'Pay with M-Pesa'}
                                    </button>
                                </div>
                            )}

                            {method === 'STRIPE' && (
                                <div>
                                    {!clientSecret ? (
                                        <button
                                            onClick={() => initiateStripe.mutate()}
                                            disabled={initiateStripe.isPending}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
                                        >
                                            {initiateStripe.isPending ? 'Loading secure payment...' : 'Proceed to Card Payment'}
                                        </button>
                                    ) : (
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                                <StripeCheckoutForm onSuccess={() => setCompleted(true)} amount={order?.total || 0} />
                                            </Elements>
                                        </div>
                                    )}
                                </div>
                            )}

                            {method === 'PAYPAL' && (
                                <div>
                                    <p className="text-gray-600 mb-4">You'll be redirected to PayPal to complete payment.</p>
                                    <button
                                        onClick={() => { setProcessing(true); initiatePaypal.mutate(); }}
                                        disabled={initiatePaypal.isPending || processing}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                                    >
                                        {(initiatePaypal.isPending || (processing && method === 'PAYPAL')) ? 'Processing PayPal...' : 'Pay with PayPal'}
                                    </button>
                                </div>
                            )}

                            {method === 'BANK_TRANSFER' && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-4">Transfer the exact amount to the account below and use your order number as reference.</p>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Bank:</span>
                                            <span className="font-semibold">{bankDetails.bankName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Account Name:</span>
                                            <span className="font-semibold">{bankDetails.accountName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{bankDetails.accountNumber}</span>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(bankDetails.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <FiCopy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Branch:</span>
                                            <span className="font-semibold">{bankDetails.branch}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="text-gray-500">Reference:</span>
                                            <span className="font-semibold text-blue-600">{orderNumber}</span>
                                        </div>
                                    </div>
                                    {copied && <p className="text-green-600 text-sm mt-2">Account number copied!</p>}
                                    <button
                                        onClick={() => { setProcessing(true); initiateBankTransfer.mutate(); }}
                                        disabled={processing}
                                        className="mt-4 w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 font-semibold"
                                    >
                                        {processing ? 'Processing...' : 'I\'ve Made the Transfer'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Your order will be confirmed once the payment reflects in our account.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 h-fit sticky top-24">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    {order?.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between py-2 border-b border-gray-200/30 text-sm">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>KES {item.price.toLocaleString()}</span>
                        </div>
                    ))}
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
                            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                <span className="text-xs font-medium text-green-700">M-Pesa</span>
                            </div>
                            <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                                <span className="text-xs font-medium text-purple-700">Stripe</span>
                            </div>
                            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                <span className="text-xs font-medium text-blue-700">PayPal</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">256-bit SSL Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}