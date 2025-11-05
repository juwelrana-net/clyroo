// client/src/components/ApprovePayments.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, Check } from 'lucide-react';

const ApprovePayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Default true rakhein
    const [error, setError] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    const fetchProcessingOrders = async () => {
        try {
            // Polling ke time spinner na dikhane ke liye setLoading(true) yahaan se hata diya
            const res = await axios.get('/api/admin/orders/processing', authHeaders);
            setOrders(res.data);
        } catch (err) {
            setError("Orders fetch nahi ho paye");
        } finally {
            // Pehli baar load hone ke baad spinner band ho jayega
            if (loading) setLoading(false);
        }
    };

    // --- YEH POORA BLOCK UPDATE HUA HAI ---
    useEffect(() => {
        // 1. Page load par turant fetch karein
        fetchProcessingOrders();

        // 2. Har 10 second mein naye orders ke liye check karein
        const interval = setInterval(() => {
            console.log("Polling for new orders..."); // Browser console mein check karne ke liye
            fetchProcessingOrders();
        }, 10000); // 10,000ms = 10 seconds

        // 3. Jab component band ho (jaise logout karein), toh interval ko band kar dein
        // Yeh memory leak se bachata hai
        return () => clearInterval(interval);
    }, []); // [] dependency ka matlab yeh effect sirf ek baar (mount par) chalega
    // --- UPDATE KHATAM ---


    const handleApprove = async (orderId) => {
        if (!window.confirm("Are you sure you received payment for this order?")) {
            return;
        }
        setLoadingId(orderId);
        setError(null);
        try {
            await axios.post(`/api/admin/orders/approve/${orderId}`, {}, authHeaders);
            // List se remove karein (turant UI update ke liye)
            setOrders(prev => prev.filter(o => o._id !== orderId));
        } catch (err) {
            setError(err.response?.data?.msg || "Approval failed");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Manual Approval Queue</h2>
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {/* Spinner ab sirf pehli baar load hone par dikhega */}
                {loading && <Loader2 className="animate-spin mx-auto" />}

                {!loading && orders.length === 0 && (
                    <p className="text-muted-foreground text-sm">No orders are waiting for approval.</p>
                )}

                {!loading && orders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-border">
                        <div>
                            <p className="text-foreground font-semibold">{order.product?.name || 'Deleted Product'}</p>
                            <p className="text-xs text-muted-foreground">Email: {order.customerEmail}</p>
                            <p className="text-sm font-bold text-primary">${order.priceAtPurchase.toFixed(2)}</p>
                        </div>
                        <Button
                            variant="default"
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 h-9 w-9"
                            onClick={() => handleApprove(order._id)}
                            disabled={loadingId === order._id}
                        >
                            {loadingId === order._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApprovePayments;