// client/src/components/EditCredentialForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog.jsx";

const EditCredentialForm = ({ credential, isOpen, onClose, onCredentialChange }) => {
    // Ab 'editText' ki jagah 'editData' (object) hoga
    const [editData, setEditData] = useState({});
    const [error, setError] = useState(null);
    const token = localStorage.getItem('adminToken');

    // Jab 'credential' prop badle, form ko us data se bharein
    useEffect(() => {
        if (credential && credential.credentialData) {
            // credential.credentialData pehle se hi ek object hai
            setEditData(credential.credentialData); // <-- YEH LINE SAHI HAI
        }
    }, [credential]); // Yeh tab run hoga jab 'credential' prop update hoga

    if (!credential) return null; // Agar koi credential select nahi hai

    // Edit form mein type karne par
    const handleEditChange = (key, value) => {
        setEditData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Save button click handler
    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.put(
                `/api/admin/credentials/${credential._id}`,
                { credentialData: editData }, // Poora object bhejein
                { headers: { 'x-auth-token': token } }
            );

            onCredentialChange(); // Parent ko batayein ki data badal gaya hai
            onClose(); // Popup band karein

        } catch (err) {
            setError(err.response?.data?.msg || "Update failed.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Credential</DialogTitle>
                    <DialogDescription>
                        Credential ID: {credential._id}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">

                    {/* Dynamic Fields */}
                    {Object.keys(editData).map((key) => (
                        <div key={key}>
                            <Label htmlFor={`edit-${key}`} className="text-muted-foreground">{key}</Label>
                            <Input
                                id={`edit-${key}`}
                                value={editData[key]}
                                onChange={(e) => handleEditChange(key, e.target.value)}
                            />
                        </div>
                    ))}

                    {error && <p className="text-destructive text-sm mt-2">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCredentialForm;