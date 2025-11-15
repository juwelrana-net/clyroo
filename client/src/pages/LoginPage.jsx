// client/src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react"; // useEffect add karein
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom"; // useLocation add karein
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    ShieldAlert, // Naya icon (Warning/Info ke liye)
    CheckCircle, // Naya icon (Success ke liye)
} from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- NAYA CODE ---
    const location = useLocation();
    // Yeh 'infoMessage' state mein aayega (e.g., "Registration closed")
    // Yeh 'successMessage' state mein aayega (e.g., "Registration successful")
    const [infoMessage, setInfoMessage] = useState(
        location.state?.message || null
    );
    // --- NAYA CODE KHATAM ---

    // --- NAYA EFFECT ---
    // Agar user page par navigate karke aaye (location.state se),
    // toh 5 second baad message ko clear kar dein.
    useEffect(() => {
        if (infoMessage) {
            const timer = setTimeout(() => {
                setInfoMessage(null);
                // History state ko bhi clear kar dein taaki refresh par wapas na aaye
                navigate(location.pathname, { replace: true, state: {} });
            }, 5000); // 5 seconds
            return () => clearTimeout(timer);
        }
    }, [infoMessage, navigate, location.pathname]);
    // --- NAYA EFFECT KHATAM ---

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setInfoMessage(null); // Koi bhi purana message hata dein
        setLoading(true);

        try {
            const response = await axios.post("/api/auth/login", { email, password });
            localStorage.setItem("adminToken", response.data.token);
            navigate("/admin/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.msg || "Login failed. Invalid Credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-primary">
                    Admin Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- NAYA MESSAGE BLOCK --- */}
                    {/* Yeh block error aur info/success dono messages handle karega */}
                    {infoMessage && (
                        <div
                            className={`p-3 rounded-lg flex items-center gap-3 text-sm ${infoMessage.includes("successful")
                                    ? "bg-green-500/10 text-green-500" // Success
                                    : "bg-yellow-500/10 text-yellow-500" // Info/Warning
                                }`}
                        >
                            {infoMessage.includes("successful") ? (
                                <CheckCircle size={16} />
                            ) : (
                                <ShieldAlert size={16} />
                            )}
                            {infoMessage}
                        </div>
                    )}

                    {error && (
                        <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    {/* --- NAYA MESSAGE BLOCK KHATAM --- */}

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Admin account nahi hai?{" "}
                    <Link
                        to="/register"
                        className="text-primary hover:underline font-medium"
                    >
                        Yahaan register karein
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;