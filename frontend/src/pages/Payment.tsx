import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiTruck, FiMail, FiArrowRight, FiClock, FiDollarSign, FiSmartphone, FiArrowLeft } from 'react-icons/fi';
import CheckoutSteps from '../components/CheckoutSteps';
import PageLoader from '../components/PageLoader';
import type { OrderItem } from '../types';

interface CodTerms {
    codEnabled: boolean;
    depositThreshold: number;
    requiresDeposit: boolean;
    depositAmount: number;
    balanceDue: number;
    total: number;
}

interface PaymentMethods {
    paybill: { enabled: boolean; number: string | null };
    till: { enabled: boolean; number: string | null };
}

type Channel = 'PAYBILL' | 'TILL';

interface ChannelInstructions {
    message: string;
    channel: Channel;
    businessNumber: string;
    accountNumber?: string;
    amount: number;
}

export default function PaymentPage() {
    const { orderNumber } = useParams();
    const [view, setView] = useState<'select' | 'instructions' | 'awaiting' | 'codConfirmed'>('select');
    const [instructions, setInstructions] = useState<ChannelInstructions | null>(null);
    const [payingCodDeposit, setPayingCodDeposit] = useState(false);
    const [referenceCode, setReferenceCode] = useState('');

    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: () => api.get(`/orders/${orderNumber}`).then(r => r.data),
    });

    const { data: codTerms } = useQuery<CodTerms>({
        queryKey: ['cod-terms', orderNumber],
        queryFn: () => api.get(`/payments/cash-on-delivery/terms/${orderNumber}`).then(r => r.data),
        enabled: !!orderNumber,
    });

    const { data: methods } = useQuery<PaymentMethods>({
        queryKey: ['payment-methods'],
        queryFn: () => api.get('/payments/methods').then(r => r.data),
    });

    // There's no processor callback for Paybill/Till — an admin confirms these
    // manually against the M-Pesa statement (see AdminOrders' "Confirm Payment"
    // action), so initiating one just returns the numbers to pay, it never
    // completes the order by itself.
    const initiateChannel = useMutation({
        mutationFn: ({ channel, codDeposit }: { channel: Channel; codDeposit: boolean }) =>
            api.post(`/payments/${channel.toLowerCase()}/initiate`, { orderNumber, codDeposit })
                .then(r => ({ data: r.data as ChannelInstructions, codDeposit })),
        onSuccess: ({ data, codDeposit }) => {
            setInstructions(data);
            setPayingCodDeposit(codDeposit);
            setView('instructions');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const submitReference = useMutation({
        mutationFn: () => api.post('/payments/paybill-till/reference', { orderNumber, reference: referenceCode.trim() }).then(r => r.data),
    });

    const confirmCod = useMutation({
        mutationFn: () => api.post('/payments/cash-on-delivery/initiate', { orderNumber }).then(r => r.data),
        onSuccess: () => setView('codConfirmed'),
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const handleConfirmSent = async () => {
        if (referenceCode.trim()) {
            try {
                await submitReference.mutateAsync();
            } catch (err) {
                toast.error(getErrorMessage(err));
                return;
            }
        }
        setView('awaiting');
    };

    if (orderLoading) {
        return <PageLoader />;
    }

    const paybillAvailable = !!(methods?.paybill?.enabled && methods.paybill.number);
    const tillAvailable = !!(methods?.till?.enabled && methods.till.number);

    if (view === 'awaiting') {
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
                            className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <FiClock className="text-amber-500" size={40} />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-section-title text-center mb-2 text-gray-900"
                        >
                            {payingCodDeposit ? 'Deposit Submitted!' : 'Payment Submitted!'}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-600 text-center mb-8"
                        >
                            {payingCodDeposit
                                ? `We're confirming your M-Pesa deposit against our statement. The remaining KES ${codTerms?.balanceDue?.toLocaleString() ?? ''} is due in cash when your order is delivered.`
                                : "We're confirming your M-Pesa payment against our statement. You'll get an email as soon as it's confirmed."}
                        </motion.p>

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
                                        <FiCheckCircle className="text-primary-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">We verify your payment</p>
                                        <p className="text-sm text-gray-600">Our team checks the M-Pesa statement and confirms your order — usually within a few hours.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiMail className="text-primary-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Confirmation Email</p>
                                        <p className="text-sm text-gray-600">You'll receive an email with your order details once we've confirmed payment.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <FiTruck className="text-primary-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{payingCodDeposit ? 'Balance on Delivery' : 'Order Processing'}</p>
                                        <p className="text-sm text-gray-600">
                                            {payingCodDeposit
                                                ? `Have KES ${codTerms?.balanceDue?.toLocaleString() ?? ''} ready in cash for the courier when your order arrives.`
                                                : 'Your order will be processed within 1-2 business days.'}
                                        </p>
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

    if (view === 'codConfirmed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
                <div className="max-w-3xl mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCheckCircle className="text-green-500" size={40} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-section-title mb-2 text-gray-900">Order Confirmed!</h1>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                            Pay KES {order?.total?.toLocaleString() ?? ''} in cash when your order is delivered. We'll email you as it's processed and shipped.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (view === 'instructions' && instructions) {
        const isPaybill = instructions.channel === 'PAYBILL';
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl p-8"
                    >
                        <button
                            onClick={() => setView('select')}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
                        >
                            <FiArrowLeft size={14} /> Back to payment options
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <FiSmartphone className="text-primary-500" size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl font-section-title text-gray-900">
                                    Pay via M-Pesa {isPaybill ? 'Paybill' : 'Buy Goods (Till Number)'}
                                </h1>
                                <p className="text-sm text-gray-500">Order #{orderNumber}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{isPaybill ? 'Business Number' : 'Till Number'}</span>
                                <span className="font-mono font-bold text-lg text-gray-900">{instructions.businessNumber}</span>
                            </div>
                            {isPaybill && instructions.accountNumber && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Account Number</span>
                                    <span className="font-mono font-bold text-lg text-gray-900">{instructions.accountNumber}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600">{payingCodDeposit ? 'Deposit due now' : 'Amount to pay'}</span>
                                <span className="font-mono font-bold text-lg text-primary-600">KES {instructions.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">How to pay</h3>
                            <ol className="text-sm text-gray-600 space-y-1.5 list-decimal pl-5">
                                <li>On your phone, go to M-Pesa and select {isPaybill ? 'Lipa na M-Pesa > Pay Bill' : 'Lipa na M-Pesa > Buy Goods and Services'}.</li>
                                <li>Enter the {isPaybill ? 'Business Number' : 'Till Number'} above{isPaybill ? ', then the Account Number' : ''}.</li>
                                <li>Enter the amount (KES {instructions.amount.toLocaleString()}) and your M-Pesa PIN.</li>
                                <li>You'll get an SMS confirmation from Safaricom once it goes through.</li>
                            </ol>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">M-Pesa confirmation code (optional)</label>
                            <input
                                type="text"
                                value={referenceCode}
                                onChange={(e) => setReferenceCode(e.target.value)}
                                placeholder="e.g. QGH7XXXXX1"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 transition"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">Adding this helps us confirm your payment faster, but it isn't required.</p>
                        </div>

                        <button
                            onClick={handleConfirmSent}
                            disabled={submitReference.isPending}
                            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition font-semibold disabled:opacity-50"
                        >
                            {submitReference.isPending ? 'Submitting...' : "I've Made This Payment"}
                        </button>
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

                    {(paybillAvailable || tillAvailable) && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-gray-700 mb-4">Pay the full amount now via M-Pesa.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {paybillAvailable && (
                                    <button
                                        onClick={() => initiateChannel.mutate({ channel: 'PAYBILL', codDeposit: false })}
                                        disabled={initiateChannel.isPending}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition text-left disabled:opacity-50"
                                    >
                                        <div className="p-2 rounded-full bg-primary-50 text-primary-500 flex-shrink-0">
                                            <FiSmartphone size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">Pay via Paybill</p>
                                            <p className="text-xs text-gray-500">M-Pesa Pay Bill</p>
                                        </div>
                                    </button>
                                )}
                                {tillAvailable && (
                                    <button
                                        onClick={() => initiateChannel.mutate({ channel: 'TILL', codDeposit: false })}
                                        disabled={initiateChannel.isPending}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition text-left disabled:opacity-50"
                                    >
                                        <div className="p-2 rounded-full bg-primary-50 text-primary-500 flex-shrink-0">
                                            <FiSmartphone size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">Pay via Till Number</p>
                                            <p className="text-xs text-gray-500">M-Pesa Buy Goods</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {codTerms?.codEnabled && (
                        <div className="w-full rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 rounded-full bg-primary-50 text-primary-500">
                                    <FiDollarSign size={18} />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">Pay on Delivery</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {codTerms.requiresDeposit
                                            ? `Orders over KES ${codTerms.depositThreshold.toLocaleString()} need a deposit upfront — the rest is paid in cash when it arrives.`
                                            : 'Pay the full amount in cash when your order arrives.'}
                                    </p>
                                </div>
                            </div>

                            {codTerms.requiresDeposit ? (
                                <>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
                                        <div className="flex justify-between text-gray-700">
                                            <span>Deposit due now</span>
                                            <span className="font-semibold text-gray-900">KES {codTerms.depositAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Balance on delivery</span>
                                            <span className="font-semibold text-gray-900">KES {codTerms.balanceDue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {(paybillAvailable || tillAvailable) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {paybillAvailable && (
                                                <button
                                                    onClick={() => initiateChannel.mutate({ channel: 'PAYBILL', codDeposit: true })}
                                                    disabled={initiateChannel.isPending}
                                                    className="w-full border border-primary-500 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition font-semibold disabled:opacity-50 text-sm"
                                                >
                                                    Pay Deposit via Paybill
                                                </button>
                                            )}
                                            {tillAvailable && (
                                                <button
                                                    onClick={() => initiateChannel.mutate({ channel: 'TILL', codDeposit: true })}
                                                    disabled={initiateChannel.isPending}
                                                    className="w-full border border-primary-500 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition font-semibold disabled:opacity-50 text-sm"
                                                >
                                                    Pay Deposit via Till
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                            No deposit payment method is available right now — please contact support.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => confirmCod.mutate()}
                                    disabled={confirmCod.isPending || initiateChannel.isPending}
                                    className="w-full border border-primary-500 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition font-semibold disabled:opacity-50"
                                >
                                    {confirmCod.isPending ? 'Confirming order...' : 'Confirm Cash on Delivery'}
                                </button>
                            )}
                        </div>
                    )}

                    {!paybillAvailable && !tillAvailable && !codTerms?.codEnabled && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
                            No payment methods are currently available. Please contact support to complete this order.
                        </div>
                    )}
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
                        <span>KES {order?.total?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200/30">
                        <p className="text-sm text-gray-500">Status: <span className="font-semibold text-primary-500">{order?.status}</span></p>
                    </div>
                    <Link to={`/orders/${orderNumber}`} className="block text-center text-primary-500 text-sm mt-4 hover:text-primary-600 hover:underline">
                        View Order Details
                    </Link>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-200/30">
                        <p className="text-xs text-gray-500 mb-3 text-center">Payment Options</p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <span className="text-xs font-medium text-slate-700">M-Pesa Paybill</span>
                            </div>
                            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <span className="text-xs font-medium text-slate-700">Till Number</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">Every payment verified by our team</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
