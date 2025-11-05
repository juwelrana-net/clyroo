// client/src/pages/BinancePaymentPage.jsx

import { useParams, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const BinancePaymentPage = () => {
    const { id } = useParams(); // Order ID
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null); // Binance se mila data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderStatus, setOrderStatus] = useState('Awaiting-Payment'); //

    // Effect 1: Binance invoice create karein
    useEffect(() => {
        const createInvoice = async () => {
            try {
                setLoading(true);
                const res = await axios.post('/api/payment/binance/create', { orderId: id }); //
                setInvoice(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to create Binance invoice. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        createInvoice();
    }, [id]);

    // Effect 2: Order status ko poll (check) karein
    useEffect(() => {
        if (!invoice) return; // Jab tak invoice na bane, tab tak polling na karein

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/orders/${id}`); //
                if (res.data.status === 'Completed') {
                    setOrderStatus('Completed');
                    clearInterval(interval); // Polling band karein

                    // Naye success page par redirect karein
                    navigate(`/order/success/${id}`);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000); // Har 5 second mein check karein

        return () => clearInterval(interval); // Cleanup
    }, [invoice, id]); // Jab invoice data aa jaaye tab shuru ho


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
                <h1 className="text-2xl font-bold text-primary mb-4">Pay with Binance Pay</h1>

                {loading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="animate-spin mr-2" size={32} />
                        <p className="text-muted-foreground mt-4">Generating Binance Invoice...</p>
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
                            Scan the QR code with your Binance App to pay.
                        </p>
                        <img
                            src={invoice.qrcodeLink} // Binance se mila QR code
                            alt="Binance Pay QR Code"
                            className="rounded-lg border-4 border-primary"
                        />
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-3xl font-bold text-primary">
                                ${invoice.orderAmount} <span className="text-lg">USDT</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="animate-spin" size={16} />
                            Waiting for payment confirmation...
                        </div>
                        <p className="text-xs text-muted-foreground">(We will email you the product once payment is confirmed)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BinancePaymentPage;