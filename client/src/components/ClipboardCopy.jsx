// client/src/components/ClipboardCopy.jsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Check, Copy } from 'lucide-react';

const ClipboardCopy = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // 2 second baad icon reset
        }, (err) => {
            console.error('Copy fail ho gaya: ', err);
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-primary"
        >
            {copied ? (
                <Check size={16} className="text-green-500" />
            ) : (
                <Copy size={16} />
            )}
        </Button>
    );
};

export default ClipboardCopy;