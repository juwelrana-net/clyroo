// client/src/components/PaymentSettings.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Switch } from '@/components/ui/switch.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2 } from 'lucide-react';

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        binancePayEnabled: true,
        nowPaymentsEnabled: true,
        manualPayEnabled: true,
    });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/settings/admin', authHeaders);
                setSettings(res.data);
            } catch (err) {
                console.error("Settings fetch nahi ho paye", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = async (key) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        try {
            await axios.put('/api/settings/admin',
                { key: key, value: newValue },
                authHeaders
            );
        } catch (err) {
            console.error("Setting update failed", err);
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-24"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Payment Method Settings</h2>
            <div className="space-y-4">
                {/* Binance Pay Toggle */}
                <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                    <Label htmlFor="binance-toggle" className="text-base">Binance Pay</Label>
                    <Switch
                        id="binance-toggle"
                        checked={settings.binancePayEnabled}
                        onCheckedChange={() => handleToggle('binancePayEnabled')}
                    />
                </div>

                {/* NOWPayments Toggle */}
                <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                    <Label htmlFor="nowpayments-toggle" className="text-base">NOWPayments</Label>
                    <Switch
                        id="nowpayments-toggle"
                        checked={settings.nowPaymentsEnabled}
                        onCheckedChange={() => handleToggle('nowPaymentsEnabled')}
                    />
                </div>

                {/* Manual Payments Toggle */}
                <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                    <Label htmlFor="manual-toggle" className="text-base">Manual Payment (USDT)</Label>
                    <Switch
                        id="manual-toggle"
                        checked={settings.manualPayEnabled}
                        onCheckedChange={() => handleToggle('manualPayEnabled')}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentSettings;