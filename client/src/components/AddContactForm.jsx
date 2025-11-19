// client/src/components/AddContactForm.jsx

import React, { useState } from 'react';
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

const AddContactForm = ({ onContactChange }) => {
    const [type, setType] = useState('whatsapp');
    const [value, setValue] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/contact/admin', {
                type,
                value,
                displayText,
            });

            toast.success(`Contact link "${displayText}" added!`);

            setValue('');
            setDisplayText('');
            onContactChange();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add contact link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add Contact Link</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="contact-type">Type</Label>
                    <Select onValueChange={setType} defaultValue={type}>
                        <SelectTrigger id="contact-type">
                            <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="telegram">Telegram</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="contact-display">Display Text</Label>
                    <Input
                        id="contact-display"
                        value={displayText}
                        onChange={(e) => setDisplayText(e.target.value)}
                        placeholder="e.g., Main Support"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="contact-value">
                        Value ({type === 'whatsapp' ? 'Number' : 'Username'})
                    </Label>
                    <Input
                        id="contact-value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={
                            type === 'whatsapp' ? 'e.g., 911234567890' : 'e.g., my_support_user'
                        }
                        required
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {loading ? "Adding..." : "Add Link"}
                </Button>
            </form>
        </div>
    );
};

export default AddContactForm;