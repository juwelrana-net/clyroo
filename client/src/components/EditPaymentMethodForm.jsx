// client/src/components/EditPaymentMethodForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx'; // Switch component import karein
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog.jsx";

const EditPaymentMethodForm = ({ method, isOpen, onClose, onMethodChange }) => {
    const [name, setName] = useState('');
    const [apiCode, setApiCode] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [isEnabled, setIsEnabled] = useState(true); // Naya state toggle ke liye
    const [error, setError] = useState(null);
    const token = localStorage.getItem('adminToken');

    // Jab 'method' prop badle, form ko us data se bharein
    useEffect(() => {
        if (method) {
            setName(method.name || '');
            setApiCode(method.apiCode || '');
            setIconUrl(method.iconUrl || '');
            setIsEnabled(method.isEnabled); // Toggle state set karein
        }
    }, [method]); // Yeh tab run hoga jab 'method' prop update hoga

    if (!method) return null;

    // Save button click handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.put(
                `/api/payment-methods/admin/${method._id}`,
                {
                    name,
                    apiCode,
                    iconUrl,
                    isEnabled, // Toggle state bhi bhejein
                },
                { headers: { 'x-auth-token': token } }
            );

            onMethodChange(); // Parent ko batayein ki data badal gaya hai
            onClose(); // Popup band karein

        } catch (err) {
            setError(err.response?.data?.msg || "Update failed.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Payment Method</DialogTitle>
                    <DialogDescription>
                        Make changes to "{method.name}". Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div>
                        <Label htmlFor="edit-method-name">Display Name</Label>
                        <Input id="edit-method-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., USDT (TRC20)" required />
                    </div>
                    <div>
                        <Label htmlFor="edit-method-code">NOWPayments API Code</Label>
                        <Input id="edit-method-code" value={apiCode} onChange={(e) => setApiCode(e.target.value)} placeholder="e.g., usdterc20" required />
                    </div>
                    <div>
                        <Label htmlFor="edit-method-icon">Icon URL</Label>
                        <Input id="edit-method-icon" value={iconUrl} onChange={(e) => setIconUrl(e.g.target.value)} placeholder="e.g., /images/coins/usdt.svg" />
                    </div>

                    {/* Naya Toggle Switch */}
                    <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                        <Label htmlFor="edit-method-enabled" className="text-base">
                            Enabled
                        </Label>
                        <Switch
                            id="edit-method-enabled"
                            checked={isEnabled}
                            onCheckedChange={setIsEnabled}
                        />
                    </div>

                    {error && <p className="text-destructive text-sm mt-2">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditPaymentMethodForm;