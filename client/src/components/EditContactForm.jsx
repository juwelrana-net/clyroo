// client/src/components/EditContactForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from "sonner"; // <--- Import Toast
import { Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.jsx';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog.jsx';

const EditContactForm = ({ link, isOpen, onClose, onContactChange }) => {
    const [type, setType] = useState('whatsapp');
    const [value, setValue] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (link) {
            setType(link.type || 'whatsapp');
            setValue(link.value || '');
            setDisplayText(link.displayText || '');
        }
    }, [link]);

    if (!link) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/api/contact/admin/${link._id}`, {
                type,
                value,
                displayText,
            });

            toast.success("Contact link updated successfully!");
            onContactChange();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Contact Link</DialogTitle>
                    <DialogDescription>
                        Make changes to "{link.displayText}". Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="edit-contact-type">Type</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger id="edit-contact-type">
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="telegram">Telegram</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="edit-contact-display">Display Text</Label>
                        <Input
                            id="edit-contact-display"
                            value={displayText}
                            onChange={(e) => setDisplayText(e.target.value)}
                            placeholder="e.g., Main Support"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-contact-value">
                            Value ({type === 'whatsapp' ? 'Number' : 'Username'})
                        </Label>
                        <Input
                            id="edit-contact-value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={
                                type === 'whatsapp'
                                    ? 'e.g., 911234567890'
                                    : 'e.g., my_support_user'
                            }
                            required
                        />
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

export default EditContactForm;