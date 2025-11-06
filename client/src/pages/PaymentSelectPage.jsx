// client/src/pages/PaymentSelectPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

// Naya component coin button ke liye
const CoinButton = ({ method, onClick, disabled }) => (
    <Button
        variant="outline"
        className="w-full h-16 text-lg justify-start p-4 gap-3"
        onClick={onClick}
        disabled={disabled}
    >
        {method.iconUrl ? (
            <img src={method.iconUrl} alt={method.name} className="w-8 h-8" />
        ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm text-muted-foreground">?</div>
        )}
        {method.name}
    </Button>
);

const PaymentSelectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // PaymentMethods state ab coins ki list store karega
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);

    // Naya state: User kaunsa coin select kar raha hai
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setLoadingMethods(true);

                // 1. Order details fetch karein
                const orderRes = await axios.get(`/api/orders/${id}`);
                setOrder(orderRes.data);

                // 2. Enabled coins ki list fetch karein
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

    // Naya function: Jab user "Submit Order" par click karega
    const handleSubmitOrder = () => {
        if (!selectedMethod) {
            setError("Please select a payment method first.");
            return;
        }

        setIsSubmitting(true);

        // Hum order details aur select kiya gaya coin, dono ko sessionStorage mein save karenge
        // taaki 'Confirmation' page unhein padh sake
        try {
            sessionStorage.setItem(`order_${id}_details`, JSON.stringify(order));
            sessionStorage.setItem(`order_${id}_method`, JSON.stringify(selectedMethod));

            // Naye 'Confirmation' page par redirect karein (yeh hum agle step mein banayenge)
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

    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to store
            </Link>

            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8">
                {/* 1. Order Summary */}
                <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-6 flex items-center gap-4">
                    <img src={order?.product?.imageUrl || `https://placehold.co/100x100/000000/FFFFFF?text=Product`} alt={order?.product?.name} className="w-16 h-16 rounded-md object-cover" />
                    <div>
                        <h3 className="font-semibold text-foreground">{order?.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {order?.quantity}</p>
                        <p className="text-lg font-bold text-primary">${order?.priceAtPurchase.toFixed(2)}</p>
                    </div>
                </div>

                {/* 2. Coin Selection */}
                <h1 className="text-xl font-bold text-center text-primary mb-6">Choose Payment Coin</h1>

                <div className="space-y-4">
                    {loadingMethods && <Loader2 className="animate-spin mx-auto" />}

                    {!loadingMethods && paymentMethods.length === 0 && (
                        <p className="text-center text-destructive">No payment methods are currently available.</p>
                    )}

                    {/* Coins ki list (grid layout mein) */}
                    <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                            <Button
                                key={method._id}
                                variant={selectedMethod?._id === method._id ? "default" : "outline"}
                                className="w-full h-14 justify-start p-2 gap-2"
                                onClick={() => setSelectedMethod(method)}
                            >
                                {method.iconUrl ? (
                                    <img src={method.iconUrl} alt={method.name} className="w-6 h-6" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0"></div>
                                )}
                                <span className="text-xs font-semibold">{method.name}</span>
                            </Button>
                        ))}
                    </div>

                    {error && (
                        <div className="text-destructive bg-destructive/20 p-3 rounded-lg flex items-center gap-3">
                            <AlertTriangle size={20} /> {error}
                        </div>
                    )}

                    {/* 3. Submit Button */}
                    <Button
                        className="w-full h-12 text-lg mt-4"
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