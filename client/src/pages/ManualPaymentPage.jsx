// client/src/pages/ManualPaymentPage.jsx

import { useParams, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Wallet } from 'lucide-react';
import ClipboardCopy from '@/components/ClipboardCopy.jsx';

// --- YAHAN APNA STATIC TRC20 ADDRESS DAALEIN ---
const TRC20_WALLET_ADDRESS = "0x056c77e9ce81eba39eaa2662c12e1de3a084774a"; //

const ManualPaymentPage = () => {
    const { id } = useParams(); // Order ID
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Payment submit hone ke baad
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending -> submitted

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/orders/${id}`);

                // Agar status "Processing" hai, toh user ko wait karne ko bolein
                if (res.data.status === 'Processing') {
                    setPaymentStatus('submitted');
                } else {
                    setOrder(res.data);
                }
            } catch (err) {
                setError(err.response?.data?.msg || "Order fetch nahi ho paya.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id]);

    // Effect 2: Order status ko poll (check) karein
    useEffect(() => {
        // Polling tabhi shuru karein jab user "Waiting" screen par ho
        if (paymentStatus === 'submitted') {
            const interval = setInterval(async () => {
                try {
                    // Hum /api/orders/status route istemal karenge jo humne banaya tha
                    const res = await axios.get(`/api/orders/status/${id}`);

                    if (res.data.status === 'Completed') {
                        clearInterval(interval);
                        // Naye success page par redirect karein
                        navigate(`/order/success/${id}`);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 5000); // Har 5 second mein check karein

            return () => clearInterval(interval); // Cleanup
        }
    }, [paymentStatus, id, navigate]); // Jab paymentStatus badlega tab yeh run hoga

    const handleSubmitPayment = async () => {
        setIsVerifying(true);
        setError(null);
        try {
            // Backend ko bolein ki user ne pay kar diya hai
            await axios.post(`/api/orders/submit-manual-payment/${id}`);

            // Success! User ko wait karne waale screen par le jaayein
            setPaymentStatus('submitted');

        } catch (err) {
            setError(err.response?.data?.msg || "Submission failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading...</div>;
    }

    // "Submitted" (Waiting) View
    if (paymentStatus === 'submitted') {
        return (
            <div className="container mx-auto max-w-lg px-4 py-12 text-center">
                <Loader2 size={64} className="text-yellow-500 mx-auto mb-6 animate-spin" />
                <h1 className="text-3xl font-bold text-foreground mb-4">Waiting for Approval</h1>
                <p className="text-muted-foreground mb-6">
                    We have received your submission. An admin will verify your payment shortly.
                    <br />
                    Once approved, your credentials will be sent to your email.
                </p>
                <Link to="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        );
    }

    // "Pending" (Payment) View
    return (
        <div className="container mx-auto max-w-lg px-4 py-12">
            <Link to={`/order/${id}/pay`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to payment selection
            </Link>

            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-primary mb-4">Manual Payment (USDT)</h1>

                {/* Order Summary (waisa hi hai) */}
                <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-6 flex items-center gap-4">
                    <img src={order?.product?.imageUrl || `https://placehold.co/100x100/000000/FFFFFF?text=Product`} alt={order?.product?.name} className="w-16 h-16 rounded-md object-cover" />
                    <div>
                        <h3 className="font-semibold text-foreground">{order?.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {order?.quantity}</p>
                        <p className="text-lg font-bold text-primary">${order?.priceAtPurchase.toFixed(2)}</p>
                    </div>
                </div>

                {/* Payment Details (waisa hi hai) */}
                <div className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground">
                        Please send the exact amount of USDT (TRC20) to the address below.
                    </p>

                    <div className="text-center">
                        <label className="text-xs text-muted-foreground">Amount</label>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-3xl font-bold text-primary">${order?.priceAtPurchase.toFixed(2)}</p>
                            <span className="text-lg text-muted-foreground">USDT</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${TRC20_WALLET_ADDRESS}&bgcolor=0a0a0a&color=fafafa&margin=0`}
                            alt="TRC20 Wallet QR Code"
                            className="rounded-lg border border-border"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground">TRC20 Address</label>
                        <div className="flex items-center justify-between gap-2 bg-background border border-border rounded-md p-3">
                            <Wallet size={16} className="text-primary flex-shrink-0" />
                            <p className="text-sm font-mono break-all text-muted-foreground">{TRC20_WALLET_ADDRESS}</p>
                            <ClipboardCopy textToCopy={TRC20_WALLET_ADDRESS} />
                        </div>
                    </div>

                    {error && (
                        <div className="text-destructive bg-destructive/20 p-3 rounded-lg flex items-center gap-3">
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    {/* "I Have Paid" Button */}
                    <Button
                        className="w-full py-3 text-lg"
                        onClick={handleSubmitPayment}
                        disabled={isVerifying}
                    >
                        {isVerifying ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {isVerifying ? 'Submitting...' : 'I Have Paid (Submit for Review)'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ManualPaymentPage;