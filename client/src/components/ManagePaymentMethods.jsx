// client/src/components/ManagePaymentMethods.jsx

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx'; // Toggle ke liye
import { Trash2, Edit, Loader2 } from 'lucide-react';

// Yeh component parent (Dashboard) se `ref` lega
const ManagePaymentMethods = forwardRef(({ paymentMethods, onMethodChange, onEdit }, ref) => {
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    // Parent component ko iska internal data refresh karne dein
    useImperativeHandle(ref, () => ({
        refreshList: () => {
            // Abhi ke liye, parent hi poori list refresh karega
            // Hum isse direct yahaan bhi kar sakte hain, par yeh simple hai
        }
    }));

    const handleDelete = async (methodId) => {
        if (!window.confirm("Are you sure you want to delete this payment method?")) {
            return;
        }
        setLoadingId(methodId);
        setError(null);
        try {
            await axios.delete(`/api/payment-methods/admin/${methodId}`, authHeaders);
            onMethodChange(); // List refresh karein
        } catch (err) {
            setError("Delete failed. Please try again.");
        } finally {
            setLoadingId(null);
        }
    };

    // Naya function: Coin ko enable/disable karne ke liye
    const handleToggle = async (method) => {
        setLoadingId(method._id); // Spinner dikhayein
        try {
            await axios.put(
                `/api/payment-methods/admin/${method._id}`,
                {
                    ...method, // Puraana data
                    isEnabled: !method.isEnabled // Bas 'isEnabled' ko ulta kar do
                },
                authHeaders
            );
            onMethodChange(); // List refresh karein
        } catch (err) {
            setError("Toggle failed. Please try again.");
        } finally {
            setLoadingId(null); // Spinner hatayein
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Manage Payment Methods</h2>
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {paymentMethods.length === 0 && (
                    <p className="text-muted-foreground text-sm">No payment methods found. Add one above.</p>
                )}

                {paymentMethods.map((method) => (
                    <div key={method._id} className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-border">
                        <div className="flex items-center gap-3">
                            {/* Coin Icon */}
                            {method.iconUrl ? (
                                <img src={method.iconUrl} alt={method.name} className="w-8 h-8" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">?</div>
                            )}
                            {/* Coin Details */}
                            <div>
                                <p className="text-foreground font-semibold">{method.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{method.apiCode}</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-1">
                            {/* Toggle Switch */}
                            <Switch
                                checked={method.isEnabled}
                                onCheckedChange={() => handleToggle(method)}
                                disabled={loadingId === method._id}
                            />
                            {/* Edit Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(method)} // <-- Edit ke liye
                                disabled={loadingId === method._id}
                                className="h-9 w-9"
                            >
                                <Edit size={16} />
                            </Button>
                            {/* Delete Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(method._id)}
                                disabled={loadingId === method._id}
                                className="text-destructive h-9 w-9"
                            >
                                {loadingId === method._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ManagePaymentMethods;