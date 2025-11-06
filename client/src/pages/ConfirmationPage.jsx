// client/src/pages/ConfirmationPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

const ConfirmationPage = () => {
    const { id } = useParams(); // URL se Order ID
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [method, setMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

    // Page load par, sessionStorage se order details aur coin details padhein
    useEffect(() => {
        try {
            const orderData = sessionStorage.getItem(`order_${id}_details`);
            const methodData = sessionStorage.getItem(`order_${id}_method`);

            if (!orderData || !methodData) {
                setError("Order session expired or data missing. Please try again.");
            } else {
                setOrder(JSON.parse(orderData));
                setMethod(JSON.parse(methodData));
            }
        } catch (e) {
            setError("Failed to load order details. Please go back and try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handlePayNow = async () => {
        setIsCreatingInvoice(true);
        setError(null);
        try {
            // NOWPayments ko naya invoice create karne ke liye bolein
            // Hum Order ID aur user ka chuna hua coin (apiCode) bhejenge
            const res = await axios.post('/api/payment/nowpayments/create', {
                orderId: order._id,
                coinApiCode: method.apiCode
            });

            // NOWPayments se mile invoice data ko agle page ke liye save karein
            sessionStorage.setItem(`order_${id}_invoice`, JSON.stringify(res.data));

            // Final payment page par redirect karein
            navigate(`/order/${id}/nowpayments`);

        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create payment invoice. Please try again.");
            setIsCreatingInvoice(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /></div>;
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-md px-4 py-12 text-center">
                <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link to="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        );
    }

    if (!order || !method) {
        return null; // Safety check
    }

    // Unit price calculate karein
    const unitPrice = (order.priceAtPurchase / order.quantity).toFixed(2);

    return (
        <div className="container mx-auto max-w-md px-4 py-12">

            <Link to={`/order/${id}/pay`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to coin selection
            </Link>

            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-primary mb-6">Confirm Order</h1>

                <div className="bg-background/50 border border-border/50 rounded-lg p-6 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order No:</span>
                        <span className="font-mono text-foreground font-semibold break-all text-right">{order._id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order name:</span>
                        <span className="font-semibold text-foreground text-right">{order.product.name} x {order.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit price:</span>
                        <span className="font-semibold text-foreground">${unitPrice}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total item price:</span>
                        <span className="font-bold text-primary text-xl">${order.priceAtPurchase.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Receiver Email:</span>
                        <span className="font-semibold text-foreground">{order.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment terms:</span>
                        <span className="font-semibold text-foreground">{method.name}</span>
                    </div>
                </div>

                {error && (
                    <div className="text-destructive bg-destructive/20 p-3 rounded-lg flex items-center gap-3 mt-4">
                        <AlertTriangle size={20} /> {error}
                    </div>
                )}

                <Button
                    className="w-full h-12 text-lg mt-6"
                    onClick={handlePayNow}
                    disabled={isCreatingInvoice}
                >
                    {isCreatingInvoice ? <Loader2 className="animate-spin" /> : "Pay Now"}
                </Button>
            </div>
        </div>
    );
};

export default ConfirmationPage;