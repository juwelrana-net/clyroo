// client/src/components/EditPaymentMethodForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { toast } from "sonner"; // <--- Import Toast
import { Loader2 } from 'lucide-react';
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
    const [isEnabled, setIsEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (method) {
            setName(method.name || '');
            setApiCode(method.apiCode || '');
            setIconUrl(method.iconUrl || '');
            setIsEnabled(method.isEnabled);
        }
    }, [method]);

    if (!method) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(
                `/api/payment-methods/admin/${method._id}`,
                {
                    name,
                    apiCode,
                    iconUrl,
                    isEnabled,
                },
                { headers: { 'x-auth-token': token } }
            );

            toast.success("Payment method updated successfully!");
            onMethodChange();
            onClose();

        } catch (err) {
            toast.error(err.response?.data?.msg || "Update failed.");
        } finally {
            setLoading(false);
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
                        <Input id="edit-method-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="edit-method-code">NOWPayments API Code</Label>
                        <Input id="edit-method-code" value={apiCode} onChange={(e) => setApiCode(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="edit-method-icon">Icon URL</Label>
                        <Input id="edit-method-icon" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                        <Label htmlFor="edit-method-enabled" className="text-base">Enabled</Label>
                        <Switch
                            id="edit-method-enabled"
                            checked={isEnabled}
                            onCheckedChange={setIsEnabled}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditPaymentMethodForm;