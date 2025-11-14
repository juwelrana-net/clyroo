// client/src/components/NotificationSettingsForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Loader2, CheckCircle } from 'lucide-react';

const NotificationSettingsForm = () => {
    // Settings ko store karne ke liye state
    const [settings, setSettings] = useState({
        enablePushNotifications: true,
        enableEmailNotifications: false,
        adminNotificationEmail: '',
        enableTelegramNotifications: false,
        telegramBotToken: '',
        telegramChatId: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // 1. Page load par current settings fetch karein
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/settings/admin');
                setSettings(res.data);
            } catch (err) {
                setError('Failed to load settings.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // 2. Form mein input change handle karein
    const handleChange = (e) => {
        const { id, value } = e.target;
        setSettings((prev) => ({ ...prev, [id]: value }));
    };

    // 3. Toggle switch change handle karein
    const handleSwitchChange = (id, checked) => {
        setSettings((prev) => ({ ...prev, [id]: checked }));
    };

    // 4. Save button click handle karein
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            // Nayi settings ko PUT request se bhejein
            await api.put('/api/settings/admin', settings);
            setSuccess('Settings saved successfully!');
            // Success message ko 3 second baad hatayein
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to save settings.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-secondary/30 border border-border rounded-lg p-6 flex justify-center items-center h-40">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">
                Sale Notifications
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
                {/* --- Push Notifications --- */}
                <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                    <Label htmlFor="enablePushNotifications" className="text-base">
                        Enable Push Notifications (Browser)
                    </Label>
                    <Switch
                        id="enablePushNotifications"
                        checked={settings.enablePushNotifications}
                        onCheckedChange={(checked) =>
                            handleSwitchChange('enablePushNotifications', checked)
                        }
                    />
                </div>

                {/* --- Email Notifications --- */}
                <div className="space-y-4 p-4 rounded-md border border-border bg-background">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enableEmailNotifications" className="text-base">
                            Enable Email Notifications
                        </Label>
                        <Switch
                            id="enableEmailNotifications"
                            checked={settings.enableEmailNotifications}
                            onCheckedChange={(checked) =>
                                handleSwitchChange('enableEmailNotifications', checked)
                            }
                        />
                    </div>
                    {/* Email input (sirf tab dikhega jab email enabled ho) */}
                    {settings.enableEmailNotifications && (
                        <div>
                            <Label htmlFor="adminNotificationEmail">Admin Email</Label>
                            <Input
                                id="adminNotificationEmail"
                                type="email"
                                value={settings.adminNotificationEmail}
                                onChange={handleChange}
                                placeholder="admin@your-site.com"
                            />
                        </div>
                    )}
                </div>

                {/* --- Telegram Notifications --- */}
                <div className="space-y-4 p-4 rounded-md border border-border bg-background">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enableTelegramNotifications" className="text-base">
                            Enable Telegram Notifications
                        </Label>
                        <Switch
                            id="enableTelegramNotifications"
                            checked={settings.enableTelegramNotifications}
                            onCheckedChange={(checked) =>
                                handleSwitchChange('enableTelegramNotifications', checked)
                            }
                        />
                    </div>
                    {/* Telegram inputs (sirf tab dikhega jab enabled ho) */}
                    {settings.enableTelegramNotifications && (
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
                                <Input
                                    id="telegramBotToken"
                                    type="password"
                                    value={settings.telegramBotToken}
                                    onChange={handleChange}
                                    placeholder="Your bot token"
                                />
                            </div>
                            <div>
                                <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                                <Input
                                    id="telegramChatId"
                                    value={settings.telegramChatId}
                                    onChange={handleChange}
                                    placeholder="Your personal or group chat ID"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Save Button & Messages --- */}
                <div className="flex items-center justify-between">
                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                    {success && (
                        <span className="text-green-500 text-sm flex items-center">
                            <CheckCircle size={16} className="mr-1" /> {success}
                        </span>
                    )}
                    {error && <span className="text-destructive text-sm">{error}</span>}
                </div>
            </form>
        </div>
    );
};

export default NotificationSettingsForm;