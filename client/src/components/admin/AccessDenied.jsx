// client/src/components/admin/AccessDenied.jsx

import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = ({ pageName }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background rounded-lg border border-border">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
                You do not have permission to access the "{pageName}" page.
                <br />
                Please contact a Super Admin if you believe this is an error.
            </p>
        </div>
    );
};

export default AccessDenied;