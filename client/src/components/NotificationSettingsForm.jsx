// client/src/components/NotificationSettingsForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { requestNotificationPermission } from '@/lib/firebase.js'; // Import kiya
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Loader2, CheckCircle, AlertTriangle, ShieldAlert, Bell, Info, Beaker } from 'lucide-react';
import { toast } from "sonner";

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
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
    const [testing, setTesting] = useState(false);

    // 1. Settings Fetch & Permission Check
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/settings/admin');
                setSettings(res.data);
            } catch (err) {
                toast.error('Failed to load settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();

        // Check Browser Permission
        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const handleTestNotification = async () => {
        setTesting(true);
        try {
            const res = await api.post('/api/admin/test-notification');
            toast.success(res.data.msg);
            toast.info("Check your Telegram, Email, and Browser now!");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Test failed.");
        } finally {
            setTesting(false);
        }
    };

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

    // Manual Permission Request Handler
    const handleRequestPermission = async () => {
        const token = await requestNotificationPermission();
        setPermissionStatus(Notification.permission); // Update status UI
        if (token) {
            toast.success("Permission granted & Token updated!");
        } else {
            toast.error("Permission denied or failed. Check browser settings.");
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
        <div className="bg-secondary/30 border border-border rounded-lg p-6 space-y-8">

            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Bell className="h-6 w-6" /> Notification Settings
            </h2>

            <Button
                variant="outline"
                onClick={handleTestNotification}
                disabled={testing}
                className="border-primary/50 hover:bg-primary/10"
            >
                {testing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Beaker className="mr-2 h-4 w-4" />}
                {testing ? "Sending..." : "Send Test Alert"}
            </Button>

            {/* --- NEW: BROWSER PERMISSION DIAGNOSTICS --- */}
            <div className="bg-background border border-border rounded-md p-5 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    Browser Permission Status
                    {permissionStatus === 'granted' && <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full border border-green-500/50">Active</span>}
                    {permissionStatus === 'denied' && <span className="text-xs bg-red-500/20 text-red-600 px-2 py-1 rounded-full border border-red-500/50">Blocked</span>}
                    {permissionStatus === 'default' && <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full border border-yellow-500/50">Action Needed</span>}
                </h3>

                {permissionStatus === 'default' && (
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            The browser has not yet been authorized to receive notifications.
                        </p>
                        <Button size="sm" onClick={handleRequestPermission}>
                            Allow Notifications
                        </Button>
                    </div>
                )}

                {permissionStatus === 'denied' && (
                    <div className="bg-destructive/10 border border-destructive/30 p-3 rounded text-sm text-destructive flex gap-3 items-start">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Notifications are blocked!</strong>
                            <p>We cannot force the permission popup again. Please click the 🔒 <b>Lock Icon</b> or ⚙️ <b>Settings Icon</b> in your browser's address bar and select "Reset permission" or "Allow". Then refresh the page.</p>
                        </div>
                    </div>
                )}

                {/* --- BRAVE & ADBLOCKER WARNING --- */}
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded text-sm text-blue-600 dark:text-blue-400 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                        <ShieldAlert className="h-5 w-5" />
                        <span>Troubleshooting: Brave Browser & Ad Blockers</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                        <li>
                            <b>Disable Ad Blockers:</b> Extensions like "uBlock Origin" or "AdBlock" can block Firebase scripts. Please disable them for this admin panel.
                        </li>
                        <li>
                            <b>Brave Browser Users:</b> Brave blocks Google Services by default. To fix:
                            <ol className="list-decimal list-inside pl-5 mt-1 text-xs opacity-90">
                                <li>Go to <code className="bg-black/10 px-1 rounded">brave://settings/privacy</code></li>
                                <li>Find "Use Google Services for Push Messaging"</li>
                                <li>Toggle it <b>ON</b> and restart Brave.</li>
                            </ol>
                        </li>
                    </ul>
                </div>
            </div>

            {/* --- EXISTING FORM --- */}
            <form onSubmit={handleSave} className="space-y-6">
                {/* --- Push Notifications Switch --- */}
                <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                    <div className="space-y-0.5">
                        <Label htmlFor="enablePushNotifications" className="text-base">
                            System Push Notifications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Receive alerts directly on your device/browser.
                        </p>
                    </div>
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
                                <div className="flex gap-2">
                                    <Input
                                        id="telegramChatId"
                                        value={settings.telegramChatId}
                                        onChange={handleChange}
                                        placeholder="Your personal or group chat ID"
                                    />
                                    <Button type="button" variant="outline" onClick={() => window.open('https://t.me/userinfobot', '_blank')}>
                                        Find ID
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Note: You must start the bot in your chat first!
                                </p>
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