// client/src/pages/OrderInquiryPage.jsx

import React, { useState } from "react";
import axios from "axios";
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner"; // <--- Import Toast
import ClipboardCopy from "@/components/ClipboardCopy.jsx";

// Search Result Component (Waisa hi rahega)
const OrderResult = ({ order }) => {
    return (
        <div className="mt-8">
            <div className="text-center mb-6">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground">Order Found</h2>
                <p className="text-muted-foreground">
                    Your credentials for Order ID: {order._id}
                </p>
            </div>

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
        </div>
    );
};

const OrderInquiryPage = () => {
    const [orderId, setOrderId] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrderData(null);

        if (!orderId || !token) {
            toast.error("Please provide both Order ID and Access Token.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(
                `/api/orders/complete/${orderId.trim()}/token/${token.trim()}`
            );
            setOrderData(res.data);
            toast.success("Order found successfully!"); // Success message
        } catch (err) {
            const errMsg = err.response?.data?.msg || "Failed to fetch order details.";
            toast.error(errMsg); // Error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-4xl font-extrabold text-center text-primary mb-8">
                Order Inquiry
            </h1>
            <p className="text-center text-muted-foreground mb-6">
                Please enter your Order ID and Access Token to find your order.
                You can find these details in your confirmation email or on the success page after payment.
            </p>

            <form onSubmit={handleSearch} className="bg-secondary/30 border border-border rounded-lg shadow-lg p-8 space-y-6">
                <div>
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                        id="orderId"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Enter your Order ID"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="token">Access Token (Secret)</Label>
                    <Input
                        id="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter your secret Access Token"
                        required
                    />
                </div>

                {/* Error Div Hata Diya Gaya Hai (Ab Toast aayega) */}

                <Button type="submit" className="w-full text-lg" disabled={loading}>
                    {loading ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <Search className="mr-2" size={20} />
                    )}
                    {loading ? "Searching..." : "Search Order"}
                </Button>
            </form>

            {orderData && (
                <OrderResult order={orderData} />
            )}
        </div>
    );
};

export default OrderInquiryPage;