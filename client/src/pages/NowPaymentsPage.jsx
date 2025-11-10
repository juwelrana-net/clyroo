// client/src/pages/NowPaymentsPage.jsx

import { useParams, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, AlertCircle, ArrowLeft, Wallet } from 'lucide-react';
import ClipboardCopy from '@/components/ClipboardCopy.jsx';

// --- Naya Timer component ---
const CountdownTimer = ({ expiryDate }) => {
    const calculateTimeLeft = () => {
        const difference = new Date(expiryDate) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <span className="text-4xl font-bold text-destructive">
            {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
        </span>
    );
};
// --- Timer component khatam ---


const NowPaymentsPage = () => {
    const { id } = useParams(); // Order ID
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null); // NOWPayments se mila data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Effect 1: SessionStorage se invoice data load karein
    useEffect(() => {
        try {
            const invoiceData = sessionStorage.getItem(`order_${id}_invoice`);
            if (!invoiceData) {
                setError("Payment session expired or data missing. Please try again.");
            } else {
                setInvoice(JSON.parse(invoiceData));
            }
        } catch (e) {
            setError("Failed to load payment details. Please go back and try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Effect 2: Order status ko poll (check) karein
    useEffect(() => {
        if (!invoice) return;

        const interval = setInterval(async () => {
            try {
                // Hum /api/orders/status route ka istemal karenge
                const res = await axios.get(`/api/orders/status/${id}`);
                const newStatus = res.data.status;

                // 1. Agar payment poora ho gaya
                if (newStatus === 'Completed') {
                    clearInterval(interval);
                    sessionStorage.removeItem(`order_${id}_details`);
                    sessionStorage.removeItem(`order_${id}_method`);
                    sessionStorage.removeItem(`order_${id}_invoice`);
                    navigate(`/order/success/${id}`); // Success page par jao
                }

                // 2. Agar payment fail ho gaya ya aadha hua
                if (newStatus === 'Partially_paid' || newStatus === 'Failed' || newStatus === 'Expired') {
                    clearInterval(interval); // Polling band karo

                    if (newStatus === 'Partially_paid') {
                        setError("Payment was partially paid. The seller has been notified. Please contact support.");
                    } else if (newStatus === 'Expired') {
                        setError("Payment session expired. Please go back and try again.");
                    } else {
                        setError("Payment failed. Please go back and try again.");
                    }
                }

                // Agar status abhi bhi "Awaiting-Payment" hai, toh polling chalti rahegi...

            } catch (err) {
                // Agar order hi delete ho gaya (ya koi aur error)
                clearInterval(interval);
                console.error("Polling error:", err);
                setError("An error occurred while checking status. Please refresh.");
            }
        }, 5000); // Har 5 second mein check karein

        return () => clearInterval(interval);
    }, [invoice, id, navigate]); // 'navigate' ko dependency mein add kiya


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /></div>;
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-md px-4 py-12 text-center">
                <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link to={`/order/${id}/pay`}>
                    <Button variant="outline">Go Back</Button>
                </Link>
            </div>
        );
    }

    if (!invoice) return null; // Safety check

    return (
        <div className="container mx-auto max-w-lg px-4 py-12">
            <Link to={`/order/${id}/confirm`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to confirmation
            </Link>

            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8 text-center">

                <h1 className="text-2xl font-bold text-primary mb-4">
                    You are paying {invoice.pay_currency.toUpperCase()}
                </h1>

                <p className="text-lg text-muted-foreground mb-4">Time left:</p>
                <div className="mb-4">
                    <CountdownTimer expiryDate={invoice.valid_until} />
                </div>

                <p className="text-sm text-destructive/80 mb-6">
                    Please double check the blockchain and currency to avoid losing assets or payment failures!!!
                </p>

                <div className="flex flex-col items-center gap-6">
                    {/* QR Code */}
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${invoice.pay_address}&bgcolor=0a0a0a&color=fafafa&margin=0`}
                        alt="Payment QR Code"
                        className="rounded-lg border border-border"
                    />

                    {/* Amount */}
                    <div className="text-center w-full">
                        <label className="text-xs text-muted-foreground">Amount ({invoice.pay_currency.toUpperCase()})</label>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-3xl font-bold text-primary">{invoice.pay_amount}</p>
                            <ClipboardCopy textToCopy={invoice.pay_amount} />
                        </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="w-full">
                        <label className="text-xs text-muted-foreground">Payment Address</label>
                        <div className="flex items-center justify-between gap-2 bg-background border border-border rounded-md p-3">
                            <Wallet size={16} className="text-primary flex-shrink-0" />
                            <p className="text-sm font-mono break-all text-muted-foreground">
                                {invoice.pay_address}
                            </p>
                            <ClipboardCopy textToCopy={invoice.pay_address} />
                        </div>
                    </div>

                    {/* Order No & Expiration */}
                    <div className="w-full text-xs text-muted-foreground border-t border-border/50 pt-4 space-y-1">
                        <div className="flex justify-between">
                            <span>Order No:</span>
                            <span className="font-mono">{invoice.order_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Expiration:</span>
                            <span className="font-mono">{new Date(invoice.valid_until).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground mt-4">
                        <Loader2 className="animate-spin" size={16} />
                        Waiting for payment confirmation...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NowPaymentsPage;