// client/src/pages/ConfirmationPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast

const ConfirmationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [method, setMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

    useEffect(() => {
        try {
            const orderData = sessionStorage.getItem(`order_${id}_details`);
            const methodData = sessionStorage.getItem(`order_${id}_method`);

            if (!orderData || !methodData) {
                toast.error("Session expired. Please start over.");
                navigate('/'); // Redirect home on critical error
            } else {
                setOrder(JSON.parse(orderData));
                setMethod(JSON.parse(methodData));
            }
        } catch (e) {
            toast.error("Failed to load order details.");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const handlePayNow = async () => {
        setIsCreatingInvoice(true);
        try {
            const res = await axios.post('/api/payment/nowpayments/create', {
                orderId: order._id,
                coinApiCode: method.apiCode
            });

            sessionStorage.setItem(`order_${id}_invoice`, JSON.stringify(res.data));

            toast.success("Invoice created! Redirecting to payment...");
            navigate(`/order/${id}/nowpayments`);

        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to create payment invoice. Please try again.");
            setIsCreatingInvoice(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /></div>;
    }

    if (!order || !method) return null;

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

                {/* Error div removed, Toast handles it */}

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