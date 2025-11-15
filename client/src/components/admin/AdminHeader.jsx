// client/src/components/admin/AdminHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ThemeToggle } from '@/components/ThemeToggle.jsx';
import { Menu, Package2 } from 'lucide-react';
// Sheet component (mobile drawer) ko import karein
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet.jsx';
// Sidebar content ko import karein
import AdminSidebarContent from './AdminSidebarContent.jsx';

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,      // <-- Yeh add karein
    SheetTitle,       // <-- Yeh add karein
    SheetDescription  // <-- Yeh add karein
} from '@/components/ui/sheet.jsx';

const AdminHeader = () => {
    // Aapke instruction ke mutabik: left-side (mobile par) menu, right-side theme toggle
    return (
        // Yeh header content area ke upar "chipka" (sticky) rahega
        <header className="flex h-16 items-center justify-between gap-4 bg-background px-4 md:px-6 rounded-xl border border-border shadow-lg">

            {/* Left Side: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">

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
                            <SheetHeader className="sr-only"> {/* sr-only class isse chhupa degi */}
                                <SheetTitle>Admin Menu</SheetTitle>
                                <SheetDescription>
                                    Admin panel navigation links
                                </SheetDescription>
                            </SheetHeader>

                            {/* Reusable content (bina logo waala) */}
                            <AdminSidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo (Aapke instruction ke mutabik) */}
                <Link to="/admin/dashboard" className="flex items-center gap-2">
                    <Package2 size={24} className="text-primary" />
                    <span className="text-xl font-bold text-primary">clyroo</span>
                </Link>
            </div>


            {/* Right Side: Theme Toggle */}
            <div>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default AdminHeader;