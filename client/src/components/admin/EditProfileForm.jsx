// client/src/components/admin/EditProfileForm.jsx

import React, { useState } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog.jsx';

const EditProfileForm = ({ isOpen, onClose, onProfileUpdate, currentUser }) => {
    // Form state ko current user data se bharein
    const [name, setName] = useState(currentUser.name || '');
    const [email, setEmail] = useState(currentUser.email || '');
    const [password, setPassword] = useState(''); // Password hamesha khaali rakhein
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(currentUser.profileImageUrl || null);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Jab currentUser badle (e.g., refresh ke baad), toh form update ho
    // useEffect(() => {
    //     if (currentUser) {
    //         setName(currentUser.name);
    //         setEmail(currentUser.email);
    //         setImagePreview(currentUser.profileImageUrl);
    //     }
    // }, [currentUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (password) {
            formData.append('password', password); // Sirf tab bhejein agar naya password hai
        }
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            // Naya PUT route call karein
            await api.put('/api/profile/update', formData);

            onProfileUpdate(); // Layout ko batayein ki data refresh karna hai
            onClose(); // Popup band karein

        } catch (err) {
            setError(err.response?.data?.msg || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Apne account details yahaan update karein.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">

                    {/* Image Upload */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>
                            <Input id="editProfileImage" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute bottom-0 right-0 rounded-full"
                                onClick={() => document.getElementById('editProfileImage').click()}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="edit-password">New Password (Optional)</Label>
                        <div className="relative">
                            <Input
                                id="edit-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Change karna ho toh type karein"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileForm;