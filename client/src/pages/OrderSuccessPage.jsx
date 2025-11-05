// client/src/pages/OrderSuccessPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button.jsx";
import {
    Loader2,
    AlertCircle,
    CheckCircle,
    Home,
} from "lucide-react";
import ClipboardCopy from "@/components/ClipboardCopy.jsx";

const OrderSuccessPage = () => {
    const { id } = useParams(); // URL se Order ID
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // sessionStorage se secret token padhein
    const customerToken = sessionStorage.getItem(id);

    useEffect(() => {
        if (!customerToken) {
            setError("Access Denied. Invalid or expired order session.");
            setLoading(false);
            return;
        }

        const fetchCredentials = async () => {
            try {
                setLoading(true);
                // Naye secure route ko call karein
                const res = await axios.get(
                    `/api/orders/complete/${id}/token/${customerToken}`
                );
                setOrder(res.data);
            } catch (err) {
                const errMsg = err.response?.data?.msg || "Failed to fetch order details.";

                // Agar order abhi bhi "Processing" hai
                if (err.response?.data?.status === 'Processing') {
                    setError("Your order is still processing. Please wait for admin approval. This page will refresh.");
                    // 5 second baad automatic refresh karein
                    setTimeout(() => window.location.reload(), 5000);
                } else {
                    setError(errMsg);
                }

            } finally {
                setLoading(false);
            }
        };

        fetchCredentials();
    }, [id, customerToken]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-primary">
                <Loader2 className="animate-spin mr-2" size={32} />
                <p className="text-xl">Verifying your order...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-lg px-4 py-12 text-center">
                <AlertCircle size={64} className="text-destructive mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-destructive-foreground mb-4">
                    Error
                </h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link to="/">
                    <Button>
                        <Home size={16} className="mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        );
    }

    if (!order) {
        return null; // Aisa nahi hona chahiye, par safety ke liye
    }

    // --- Success View ---
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="text-center mb-8">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                <h1 className="text-4xl font-extrabold text-foreground mb-4">
                    Payment Successful!
                </h1>
                <p className="text-lg text-muted-foreground">
                    Your order is complete. Your product credentials are listed below.
                </p>
                <p className="text-sm text-muted-foreground">
                    (A copy has also been sent to: {order.customerEmail})
                </p>
            </div>

            {/* Credentials List */}
            <div className="space-y-4">
                {order.deliveredCredentials.map((cred, index) => (
                    <div
                        key={cred._id || index}
                        className="bg-secondary/30 border border-border rounded-lg shadow-lg p-6"
                    >
                        <h3 className="text-xl font-semibold text-primary mb-4 border-b border-border/50 pb-2">
                            Product #{index + 1}
                        </h3>
                        <div className="space-y-3">
                            {/* Mongoose Map ko object mein convert karke iterate karein */}
                            {Object.entries(cred.credentialData).map(([key, value]) => (
                                <div key={key}>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {key}
                                    </label>
                                    <div className="flex items-center justify-between gap-2 bg-background border border-border rounded-md p-3">
                                        <p className="text-sm font-mono break-all text-foreground">
                                            {value}
                                        </p>
                                        <ClipboardCopy textToCopy={value} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Home Button */}
            <div className="text-center mt-10">
                <Link to="/">
                    <Button size="lg" className="text-lg">
                        <Home size={20} className="mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;