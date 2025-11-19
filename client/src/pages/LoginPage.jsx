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
    ShieldAlert,
    CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    // const [infoMessage, setInfoMessage] = useState(
    //     location.state?.message || null
    // );

    useEffect(() => {
        if (location.state?.message) {
            // Agar koi message lekar aaya hai (jaise register page se), toh toast dikhao
            toast.info(location.state.message);

            // State clear kar do taaki refresh par wapas na dikhe
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setError(null);
        // setInfoMessage(null);
        setLoading(true);

        try {
            const response = await axios.post("/api/auth/login", { email, password });
            localStorage.setItem("adminToken", response.data.token);

            toast.success("Login successful! Welcome back.");
            navigate("/admin/dashboard");
        } catch (err) {
            const errorMsg = err.response?.data?.msg || "Login failed. Invalid Credentials.";
            toast.error(errorMsg);
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
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-primary hover:underline font-medium"
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;