// client/src/pages/NowPaymentsPage.jsx

import { useParams, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Wallet } from 'lucide-react';
import ClipboardCopy from '@/components/ClipboardCopy.jsx';

const NowPaymentsPage = () => {
    const { id } = useParams(); // Order ID
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null); // NOWPayments se mila data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderStatus, setOrderStatus] = useState('Awaiting-Payment');

    // Effect 1: NOWPayments invoice create karein
    useEffect(() => {
        const createInvoice = async () => {
            try {
                setLoading(true);
                const res = await axios.post('/api/payment/nowpayments/create', { orderId: id });
                setInvoice(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to create NOWPayments invoice. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        createInvoice();
    }, [id]);

    // Effect 2: Order status ko poll (check) karein
    useEffect(() => {
        if (!invoice) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/orders/${id}`);
                if (res.data.status === 'Completed') {
                    setOrderStatus('Completed');
                    clearInterval(interval);

                    // Naye success page par redirect karein
                    navigate(`/order/success/${id}`);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000); // Har 5 second mein check karein

        return () => clearInterval(interval);
    }, [invoice, id]);


    // if (orderStatus === 'Completed') {
    //     return (
    //         <div className="container mx-auto max-w-lg px-4 py-12 text-center">
    //             <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
    //             <h1 className="text-3xl font-bold text-foreground mb-4">Payment Received!</h1>
    //             <p className="text-muted-foreground mb-6">
    //                 Your order is complete. We have sent the credentials to your email.
    //             </p>
    //             <Link to="/">
    //                 <Button>Back to Home</Button>
    //             </Link>
    //         </div>
    //     );
    // }

    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <Link to={`/order/${id}/pay`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to payment selection
            </Link>

            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8 text-center">
                <h1 className="text-2xl font-bold text-primary mb-4">Pay with USDT (ERC20)</h1>

                {loading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="animate-spin mr-2" size={32} />
                        <p className="text-muted-foreground mt-4">Generating Invoice...</p>
                    </div>
                )}

                {error && (
                    <div className="text-destructive bg-destructive/20 p-4 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {invoice && !loading && !error && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-muted-foreground">
                            Send the exact amount to the address below.
                        </p>

                        {/* QR Code */}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${invoice.pay_address}&bgcolor=0a0a0a&color=fafafa&margin=0`}
                            alt="ERC20 Wallet QR Code"
                            className="rounded-lg border border-border"
                        />

                        {/* Amount */}
                        <div className="text-center">
                            <label className="text-xs text-muted-foreground">Amount (USDT)</label>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-2xl font-bold text-primary">{invoice.pay_amount}</p>
                                <ClipboardCopy textToCopy={invoice.pay_amount} />
                            </div>
                        </div>

                        {/* Wallet Address */}
                        <div>
                            <label className="text-xs text-muted-foreground">ERC20 Address</label>
                            <div className="flex items-center justify-between gap-2 bg-background border border-border rounded-md p-3">
                                <Wallet size={16} className="text-primary flex-shrink-0" />
                                <p className="text-sm font-mono break-all text-muted-foreground">
                                    {invoice.pay_address}
                                </p>
                                <ClipboardCopy textToCopy={invoice.pay_address} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground mt-4">
                            <Loader2 className="animate-spin" size={16} />
                            Waiting for payment confirmation...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NowPaymentsPage;