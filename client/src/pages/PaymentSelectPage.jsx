// client/src/pages/PaymentSelectPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, ArrowLeft, Wallet, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog.jsx";

const PaymentSelectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState({});
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [isManualWarningOpen, setIsManualWarningOpen] = useState(false);

    // --- NAYA STATE LOADING KE LIYE ---
    const [isPreparing, setIsPreparing] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // ... (waisa hi hai)
                setLoading(true); setLoadingMethods(true);
                const orderRes = await axios.get(`/api/orders/${id}`);
                setOrder(orderRes.data);
                const settingsRes = await axios.get('/api/settings/payment-methods');
                setPaymentMethods(settingsRes.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Order fetch nahi ho paya.");
            } finally {
                setLoading(false); setLoadingMethods(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleSelectBinance = () => navigate(`/order/${id}/binance`);
    const handleSelectNowPayments = () => navigate(`/order/${id}/nowpayments`);

    // --- YEH FUNCTION UPDATE HUA HAI ---
    const handleConfirmManualPay = async () => {
        setIsPreparing(true);
        try {
            // Step 1: Server ko batao ki hum manual payment shuru kar rahe hain
            await axios.post(`/api/orders/prepare-manual-payment/${id}`);

            // Step 2: Ab manual page par jaao
            navigate(`/order/${id}/manual`);

        } catch (err) {
            setError("Could not prepare manual payment. Please try again.");
        } finally {
            setIsPreparing(false);
            setIsManualWarningOpen(false);
        }
    };
    // --- FUNCTION KHATAM ---

    if (loading || loadingMethods) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading Order...</div>;
    }

    if (error) {
        return <div className="container mx-auto max-w-md px-4 py-12 text-center text-destructive">{error}</div>;
    }

    const noMethodsEnabled = !paymentMethods.binancePayEnabled &&
        !paymentMethods.nowPaymentsEnabled &&
        !paymentMethods.manualPayEnabled;

    return (
        <div className="container mx-auto max-w-md px-4 py-12">

            <Dialog open={isManualWarningOpen} onOpenChange={setIsManualWarningOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" />
                            Manual Payment Warning
                        </DialogTitle>
                        <DialogDescription className="pt-4">
                            This payment method is slow. You will need to wait for an admin to
                            manually verify your payment. Delivery is **not** instant.
                            <br /><br />
                            Do you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManualWarningOpen(false)} disabled={isPreparing}>Cancel</Button>
                        <Button onClick={handleConfirmManualPay} disabled={isPreparing}>
                            {isPreparing && <Loader2 className="animate-spin mr-2" size={16} />}
                            Yes, Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ... (baaki page waisa hi hai) ... */}
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Back to store
            </Link>
            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-primary mb-6">Select Payment Method</h1>
                <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-6 flex items-center gap-4">
                    <img src={order?.product?.imageUrl || `https://placehold.co/100x100/000000/FFFFFF?text=Product`} alt={order?.product?.name} className="w-16 h-16 rounded-md object-cover" />
                    <div>
                        <h3 className="font-semibold text-foreground">{order?.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {order?.quantity}</p>
                        <p className="text-lg font-bold text-primary">${order?.priceAtPurchase.toFixed(2)}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {loadingMethods ? (
                        <Loader2 className="animate-spin mx-auto" />
                    ) : noMethodsEnabled ? (
                        <p className="text-center text-destructive">No payment methods are currently available.</p>
                    ) : (
                        <>
                            {paymentMethods.binancePayEnabled && (
                                <Button className="w-full h-16 text-lg justify-start p-4 gap-3" onClick={handleSelectBinance}>
                                    <img src="/images/binance.svg" alt="Binance Pay" className="w-8 h-8" />
                                    Pay with Binance Pay (Instant)
                                </Button>
                            )}
                            {paymentMethods.nowPaymentsEnabled && (
                                <Button variant="outline" className="w-full h-16 text-lg justify-start p-4 gap-3" onClick={handleSelectNowPayments}>
                                    <img src="/images/nowpayments.svg" alt="NOWPayments" className="w-8 h-8" />
                                    Pay with NOWPayments (Instant)
                                </Button>
                            )}
                            {paymentMethods.manualPayEnabled && (
                                <Button variant="outline" className="w-full h-16 text-lg justify-start p-4 gap-3 border-yellow-500/50 hover:bg-yellow-500/10" onClick={() => setIsManualWarningOpen(true)}>
                                    <Wallet size={32} className="text-yellow-500" />
                                    Pay Manually (Slow)
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSelectPage;