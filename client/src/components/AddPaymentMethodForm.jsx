// client/src/components/AddPaymentMethodForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

// Yeh component naye coins (payment methods) add karega
const AddPaymentMethodForm = ({ onMethodChange }) => {
    const [name, setName] = useState('');
    const [apiCode, setApiCode] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('adminToken');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            await axios.post('/api/payment-methods/admin',
                {
                    name,
                    apiCode,
                    iconUrl,
                },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(`Payment method "${name}" added!`);
            setName('');
            setApiCode('');
            setIconUrl('');
            onMethodChange(); // Dashboard ko refresh karein

        } catch (err) {
            setError(err.response?.data?.msg || "Method add nahi ho paya.");
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add Payment Method</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="method-name">Display Name</Label>
                    <Input id="method-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., USDT (TRC20)" required />
                </div>
                <div>
                    <Label htmlFor="method-code">NOWPayments API Code</Label>
                    <Input id="method-code" value={apiCode} onChange={(e) => setApiCode(e.target.value)} placeholder="e.g., usdterc20" required />
                </div>
                <div>
                    <Label htmlFor="method-icon">Icon URL (Optional)</Label>
                    <Input id="method-icon" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="e.g., /images/coins/usdt.svg" />
                </div>

                <Button type="submit" className="w-full">Add Method</Button>

                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default AddPaymentMethodForm;