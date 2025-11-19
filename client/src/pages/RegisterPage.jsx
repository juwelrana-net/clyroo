// client/src/pages/RegisterPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // useLocation add karein
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
    Eye,
    EyeOff,
    User,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    // const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true); // Status check karne ke liye loader
    const [registrationAllowed, setRegistrationAllowed] = useState(false); // Status save karne ke liye

    const navigate = useNavigate();

    // --- NAYA EFFECT ---
    // Page load par check karein ki registration allowed hai ya nahi
    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                setCheckingStatus(true);
                const res = await axios.get("/api/auth/registration-status");
                if (res.data.allowRegistration) {
                    setRegistrationAllowed(true);
                } else {
                    // Agar registration allowed nahi hai, toh login page par bhej dein
                    // 'replace: true' history mein entry nahi banayega
                    // 'state' se hum login page par ek message bhejenge
                    navigate("/login", {
                        replace: true,
                        state: {
                            message: "Registration is closed. Only one admin account is allowed.",
                        },
                    });
                }
            } catch (err) {
                toast.error("Could not check registration status.");
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
        // setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);

        if (profileImage) {
            formData.append("profileImage", profileImage);
        }

        try {
            await axios.post("/api/auth/register", formData);

            navigate("/login", {
                state: { message: "Registration successful! Please log in." },
            });
        } catch (err) {
            toast.error(err.response?.data?.msg || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // --- LOADER (JAB TAK STATUS CHECK HO RAHA HAI) ---
    if (checkingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center text-primary">
                <Loader2 className="animate-spin mr-2" size={24} />
                Checking registration status...
            </div>
        );
    }

    // --- AGAR REGISTRATION ALLOWED NAHI HAI (YEH EK SAFETY CHECK HAI) ---
    if (!registrationAllowed) {
        // Waise toh hum pehle hi redirect kar denge, par yeh fallback hai
        return null;
    }

    // --- AGAR REGISTRATION ALLOWED HAI, TOH FORM DIKHAYEIN ---
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
                            placeholder="Aapka poora naam"
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