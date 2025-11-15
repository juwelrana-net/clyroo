// client/src/components/admin/AdminHeader.jsx

import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ThemeToggle } from '@/components/ThemeToggle.jsx';
import { Menu } from 'lucide-react';
// Sheet component (mobile drawer) ko import karein
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet.jsx';
// Sidebar content ko import karein
import AdminSidebarContent from './AdminSidebarContent.jsx';

const AdminHeader = () => {
    // Aapke instruction ke mutabik: left-side (mobile par) menu, right-side theme toggle
    return (
        // Yeh header content area ke upar "chipka" (sticky) rahega
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">

            {/* Mobile Menu (Sheet) */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        {/* Reusable content ko yahaan call karein */}
                        <AdminSidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Spacer (taaki theme toggle right mein jaaye) */}
            <div className="flex-1">
                {/* Aap yahaan future mein page ka title ya breadcrumbs daal sakte hain */}
            </div>

            {/* Right Side: Theme Toggle */}
            <div>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default AdminHeader;