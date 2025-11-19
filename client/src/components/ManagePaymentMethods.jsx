// client/src/components/ManagePaymentMethods.jsx

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import ConfirmAlert from '@/components/ConfirmAlert.jsx'; // <--- Import

const ManagePaymentMethods = forwardRef(({ paymentMethods, onMethodChange, onEdit }, ref) => {
    const [loadingId, setLoadingId] = useState(null);
    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    // --- Delete State ---
    const [methodToDelete, setMethodToDelete] = useState(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        refreshList: () => { }
    }));

    const handleDeleteClick = (method) => {
        setMethodToDelete(method);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!methodToDelete) return;
        setLoadingId(methodToDelete._id);
        try {
            await axios.delete(`/api/payment-methods/admin/${methodToDelete._id}`, authHeaders);
            toast.success("Payment method deleted.");
            onMethodChange();
            setIsAlertOpen(false);
            setMethodToDelete(null);
        } catch (err) {
            toast.error("Failed to delete payment method.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleToggle = async (method) => {
        setLoadingId(method._id);
        try {
            await axios.put(
                `/api/payment-methods/admin/${method._id}`,
                { ...method, isEnabled: !method.isEnabled },
                authHeaders
            );
            toast.success(`Method ${!method.isEnabled ? 'enabled' : 'disabled'} successfully.`);
            onMethodChange();
        } catch (err) {
            toast.error("Failed to update status.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Manage Payment Methods</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {paymentMethods.length === 0 && (
                    <p className="text-muted-foreground text-sm">No payment methods found. Add one above.</p>
                )}

                {paymentMethods.map((method) => (
                    <div key={method._id} className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-border">
                        <div className="flex items-center gap-3">
                            {method.iconUrl ? (
                                <img src={method.iconUrl} alt={method.name} className="w-8 h-8" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">?</div>
                            )}
                            <div>
                                <p className="text-foreground font-semibold">{method.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{method.apiCode}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Switch
                                checked={method.isEnabled}
                                onCheckedChange={() => handleToggle(method)}
                                disabled={loadingId === method._id}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(method)}
                                disabled={loadingId === method._id}
                                className="h-9 w-9"
                            >
                                <Edit size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(method)} // Updated handler
                                disabled={loadingId === method._id}
                                className="text-destructive h-9 w-9"
                            >
                                {loadingId === method._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Alert */}
            <ConfirmAlert
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Payment Method?"
                description={`Are you sure you want to delete "${methodToDelete?.name}"?`}
                loading={loadingId === methodToDelete?._id}
            />
        </div>
    );
});

export default ManagePaymentMethods;