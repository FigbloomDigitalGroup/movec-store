import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { FiCreditCard, FiPhone, FiDollarSign, FiCheckCircle, FiCopy } from 'react-icons/fi';

export default function PaymentPage() {
    const { orderNumber } = useParams();
    const [method, setMethod] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('+254');
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const bankDetails = {
        bankName: 'NCBA Bank',
        accountName: 'Starlink CCTV Solutions Ltd',
        accountNumber: '1234567890',
        branch: 'Nairobi CBD',
    };

    if (completed) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12">
                    <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h1 className="text-3xl font-bold mb-2">
                        {method === 'BANK_TRANSFER' ? 'Payment Instructions' : 'Payment Initiated!'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        {method === 'BANK_TRANSFER'
                            ? 'Please complete the transfer using the details below. Your order will be confirmed once payment is received.'
                            : 'Your payment is being processed. You will receive a confirmation shortly.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to={`/orders/${orderNumber}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                            View Order
                        </Link>
                        <Link to="/products" className="border px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                            Continue Shopping
                        </Link>
                    </div>
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
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${method === 'MPESA' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-green-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiPhone className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">M-Pesa</p>
                                <p className="text-sm text-gray-500">Pay via STK Push</p>
                            </div>
                        </div>
                    </button>

                    {/* Stripe */}
                    <button
                        onClick={() => setMethod('STRIPE')}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${method === 'STRIPE' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiCreditCard className="text-purple-600" size={24} />
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
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="text-blue-600" size={24} />
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
                                    <p className="text-gray-600 mb-4">You'll be redirected to Stripe's secure payment page.</p>
                                    <button
                                        onClick={() => alert('Stripe integration requires API keys in .env')}
                                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                                    >
                                        Pay with Card
                                    </button>
                                </div>
                            )}

                            {method === 'PAYPAL' && (
                                <div>
                                    <p className="text-gray-600 mb-4">You'll be redirected to PayPal to complete payment.</p>
                                    <button
                                        onClick={() => alert('PayPal integration requires API keys in .env')}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                                    >
                                        Pay with PayPal
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
                        <div key={i} className="flex justify-between py-2 border-b text-sm">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>KES {item.price.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                        <span>Total</span>
                        <span>KES {order?.total?.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">Status: <span className="font-semibold text-blue-600">{order?.status}</span></p>
                    </div>
                    <Link to={`/orders/${orderNumber}`} className="block text-center text-blue-600 text-sm mt-4 hover:underline">
                        View Order Details
                    </Link>
                </div>
            </div>
        </div>
    );
}