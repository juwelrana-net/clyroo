// client/src/pages/RegisterPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api.js"; // <--- FIX 1: axios ki jagah api import kiya
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Eye, EyeOff, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [registrationAllowed, setRegistrationAllowed] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                setCheckingStatus(true);
                // api instance use kiya
                const res = await api.get("/api/auth/registration-status");
                if (res.data.allowRegistration) {
                    setRegistrationAllowed(true);
                } else {
                    navigate("/login", {
                        replace: true,
                        state: {
                            message: "Registration is closed. Only one admin account is allowed.",
                        },
                    });
                }
            } catch (err) {
                console.error(err);
                // Toast hata diya taaki agar network error ho toh user confuse na ho, 
                // bas infinite loader na dikhe isliye finally block hai.
            } finally {
                setCheckingStatus(false);
            }
        };

        checkRegistrationStatus();
    }, [navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);

        if (profileImage) {
            formData.append("profileImage", profileImage);
        }

        try {
            // api instance use kiya
            await api.post("/api/auth/register", formData);

            navigate("/login", {
                state: { message: "Registration successful! Please log in." },
            });
        } catch (err) {
            toast.error(err.response?.data?.msg || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center text-primary">
                <Loader2 className="animate-spin mr-2" size={24} />
                Checking registration status...
            </div>
        );
    }

    if (!registrationAllowed) {
        return null;
    }

    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-2 text-primary">
                    Create Super Admin Account
                </h1>
                <p className="text-center text-muted-foreground mb-6">
                    This will be the first and only admin account created from this page.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>
                            <Input
                                id="profileImage"
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute bottom-0 right-0 rounded-full"
                                onClick={() => document.getElementById("profileImage").click()}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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

                    {/* --- FIX 2: Password Input UI (Same as Login Page) --- */}
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
                                className="pr-10" // Padding right
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {loading ? "Registering..." : "Create Account"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-primary hover:underline font-medium"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;