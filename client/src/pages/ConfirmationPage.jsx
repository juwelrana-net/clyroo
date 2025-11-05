// client/src/pages/ConfirmationPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'; // Icons import karein
import axios from 'axios'; // Axios import karein

const ConfirmationPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Real API se order fetch karein
        const fetchOrder = async () => {
            try {
                setLoading(true);
                // Naya route jo humne banaya hai
                const res = await axios.get(`/api/orders/status/${id}`);
                setOrder(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Order details fetch nahi ho paye.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        } else {
            setError("No Order ID found in URL.");
            setLoading(false);
        }
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Fetching Order Details...</div>;

    if (error) return (
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
            <AlertCircle size={64} className="text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-destructive-foreground mb-4">Error</h1>
            <p className="text-muted-foreground">{error}</p>
            <Link to="/" className="mt-4 inline-block">
                <Button>Back to Home</Button>
            </Link>
        </div>
    );

    const getDeliveryInfo = (status) => {
        switch (status) {
            case 'Completed':
                return 'Your product details have been sent to your email.';
            case 'Processing':
                return 'Your payment is being verified. Your product will be emailed upon approval.';
            case 'Awaiting-Payment':
                return 'Your order is waiting for payment. Please complete the payment.';
            case 'Pending':
                return 'Your order is pending. Please choose a payment method.';
            case 'Cancelled':
                return 'This order has been cancelled.';
            default:
                return 'Please check your email for delivery instructions.';
        }
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-16">
            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8 text-center">

                {order.status === 'Completed' ? (
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                ) : (
                    <Loader2 size={64} className="text-yellow-500 mx-auto mb-6 animate-spin" />
                )}

                <h1 className="text-4xl font-extrabold text-foreground mb-4">
                    Order {order.status}
                </h1>

                <p className="text-xl text-primary font-semibold mb-2">Order ID: {order?._id}</p>
                <p className="text-muted-foreground mb-8">Thank you for your purchase from clyroo. Your order is now {order?.status}.</p>

                <div className="bg-background/50 border border-border rounded-lg p-6 text-left mb-8">
                    <h2 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Order Summary</h2>
                    <div className="space-y-2 text-muted-foreground">
                        <p><strong>Product:</strong> {order?.productName || 'N/A'}</p>
                        <p><strong>Total:</strong> ${order?.priceAtPurchase ? order.priceAtPurchase.toFixed(2) : 'N/A'}</p>
                        <p><strong>Contact Email:</strong> {order?.customerEmail}</p>
                    </div>
                </div>

                <div className="bg-background border border-primary/50 rounded-lg p-4 mb-8">
                    <p className="font-medium text-foreground">
                        {getDeliveryInfo(order.status)}
                    </p>
                </div>

                <Link to="/">
                    <Button className="w-full sm:w-auto">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ConfirmationPage;