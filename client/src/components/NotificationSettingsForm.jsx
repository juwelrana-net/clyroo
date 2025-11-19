// client/src/components/NotificationSettingsForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast

const NotificationSettingsForm = () => {
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

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/settings/admin');
                setSettings(res.data);
            } catch (err) {
                toast.error('Failed to load settings.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSettings((prev) => ({ ...prev, [id]: value }));
    };

    const handleSwitchChange = (id, checked) => {
        setSettings((prev) => ({ ...prev, [id]: checked }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/api/settings/admin', settings);
            toast.success('Settings saved successfully!');
        } catch (err) {
            toast.error('Failed to save settings.');
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

                <div className="flex items-center justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NotificationSettingsForm;