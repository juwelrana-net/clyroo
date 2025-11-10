// client/src/pages/PaymentSelectPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

const PaymentSelectPage = () => {
    const { id } = useParams(); // Yeh Order ID hai
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setLoadingMethods(true);

                const orderRes = await axios.get(`/api/orders/${id}`);
                setOrder(orderRes.data);

                const settingsRes = await axios.get('/api/payment-methods');
                setPaymentMethods(settingsRes.data);

            } catch (err) {
                setError(err.response?.data?.msg || "Order fetch nahi ho paya.");
            } finally {
                setLoading(false);
                setLoadingMethods(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleSubmitOrder = () => {
        if (!selectedMethod) {
            setError("Please select a payment method first.");
            return;
        }

        setIsSubmitting(true);

        try {
            sessionStorage.setItem(`order_${id}_details`, JSON.stringify(order));
            sessionStorage.setItem(`order_${id}_method`, JSON.stringify(selectedMethod));

            navigate(`/order/${id}/confirm`);

        } catch (e) {
            setError("Could not proceed. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (loading || loadingMethods) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading Order...</div>;
    }

    if (error) {
        return <div className="container mx-auto max-w-md px-4 py-12 text-center text-destructive">{error}</div>;
    }

    // --- YEH ZAROORI HAI ---
    // Agar order load nahi hua, toh link na dikhayein
    if (!order || !order.product) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading Order Details...</div>;
    }

    return (
        <div className="container mx-auto max-w-lg px-4 py-12">

            {/* --- YEH LINK AB FIX HO GAYA HAI --- */}
            {/* Hum ab 'id' (Order ID) ki jagah 'order.product._id' (Product ID) bhej rahe hain */}
            <Link to={`/product/${order.product._id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to product
            </Link>

            <div className="bg-secondary/30 border border-border/50 rounded-2xl shadow-xl p-6 md:p-8">

                <div className="bg-background/50 border border-border/50 rounded-2xl p-4 mb-8 flex items-center gap-4">
                    <img
                        src={order?.product?.imageUrl || `https://placehold.co/100x100/000000/FFFFFF?text=Product`}
                        alt={order?.product?.name}
                        className="w-20 h-20 rounded-lg object-contain"
                    />
                    <div>
                        <h3 className="font-semibold text-lg text-foreground">{order?.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {order?.quantity}</p>
                        <p className="text-2xl font-bold text-primary mt-1">${order?.priceAtPurchase.toFixed(2)}</p>
                    </div>
                </div>

                {/* Coin Selection */}
                <h1 className="text-2xl font-bold text-center text-primary mb-6">Choose Payment Coin</h1>

                <div className="space-y-4">
                    {loadingMethods && <Loader2 className="animate-spin mx-auto" />}

                    {!loadingMethods && paymentMethods.length === 0 && (
                        <p className="text-center text-destructive">No payment methods are currently available.</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                            <Button
                                key={method._id}
                                variant={selectedMethod?._id === method._id ? "default" : "outline"}
                                className="w-full h-16 justify-start p-4 gap-3 rounded-lg"
                                onClick={() => setSelectedMethod(method)}
                            >
                                {method.iconUrl ? (
                                    <img src={method.iconUrl} alt={method.name} className="w-8 h-8" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0"></div>
                                )}
                                <span className="text-base font-semibold">{method.name}</span>
                            </Button>
                        ))}
                    </div>

                    {error && (
                        <div className="text-destructive bg-destructive/20 p-3 rounded-lg flex items-center gap-3">
                            <AlertTriangle size={20} /> {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        className="w-full h-12 text-lg mt-4 rounded-lg"
                        onClick={handleSubmitOrder}
                        disabled={!selectedMethod || isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Order"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSelectPage;