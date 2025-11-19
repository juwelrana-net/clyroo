// client/src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/auth/forgotpassword', { email });
            setEmailSent(true);
            toast.success("Reset link sent to your email.");
        } catch (err) {
            // Security reason se hum generic error dikha sakte hain, 
            // par admin panel hai toh error details helpful hongi.
            toast.error(err.response?.data?.msg || "Failed to send email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md px-4 py-20">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                </Link>

                <h1 className="text-3xl font-bold text-center mb-2 text-primary">
                    Forgot Password?
                </h1>
                <p className="text-center text-muted-foreground mb-8 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {emailSent ? (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-600 p-4 rounded-lg text-center">
                        <p className="font-medium">Email Sent!</p>
                        <p className="text-sm mt-1">Please check your inbox (and spam folder) for the reset link.</p>
                        <Button
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => setEmailSent(false)}
                        >
                            Try another email
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Send Reset Link"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;