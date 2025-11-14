// client/src/App.jsx

import React, { useState, useEffect } from 'react'; // useState ko import kiya
import { Routes, Route, Link, NavLink } from 'react-router-dom'; // NavLink ko import kiya
import HomePage from './pages/HomePage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import PaymentSelectPage from './pages/PaymentSelectPage.jsx';
import NowPaymentsPage from './pages/NowPaymentsPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import OrderInquiryPage from './pages/OrderInquiryPage.jsx';

// --- NAYE IMPORTS ---
import { Package, UserCog, Menu, X, MessageCircle, Send, Loader2 } from 'lucide-react'; // Naye icons add kiye (Menu, X, MessageCircle, Send) aur Search hataya
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog.jsx"; // Contact Us popup ke liye
import { cn } from './lib/utils.js'; // Mobile menu animation ke liye
import api from './lib/api.js';

// --- NAYA PLACEHOLDER PAGE ---
// Hum "How to Buy" page ko baad mein design karenge
const HowToBuyPage = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">How to Buy</h1>
      <p className="text-muted-foreground mt-4">
        Yeh page abhi ban raha hai. Yahaan par aap instructions daal sakte hain ki customer purchase kaise kare.
      </p>
    </div>
  );
};
// --- PLACEHOLDER PAGE KHATAM ---


function App() {
  // Mobile menu (bottom sheet) aur Contact popup ko manage karne ke liye
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [publicContactLinks, setPublicContactLinks] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);

  // --- Public links fetch karne ke liye ---
  useEffect(() => {
    const fetchPublicContacts = async () => {
      setContactLoading(true);
      try {
        // Public API endpoint ko call karein (ismein token nahi chahiye)
        const res = await api.get('/api/contact');
        setPublicContactLinks(res.data);
      } catch (err) {
        console.error("Public contact links fetch nahi ho paye", err);
      } finally {
        setContactLoading(false);
      }
    };

    // Page load par ek baar fetch karein
    fetchPublicContacts();
  }, []);

  // Mobile menu band karne ke liye
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Contact popup kholne ke liye (yeh mobile menu ko bhi band kar dega)
  const openContactPopup = () => {
    closeMobileMenu();
    setIsContactOpen(true);
  };


  // NavLink ke liye common styling
  const navLinkClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground"
    );
  
  const renderContactButton = (link) => {
    if (link.type === 'whatsapp') {
      return (
        <Button
          key={link._id}
          asChild
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <a
            href={`https://wa.me/${link.value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" /> {link.displayText}
          </a>
        </Button>
      );
    }
    if (link.type === 'telegram') {
      return (
        <Button
          key={link._id}
          asChild
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <a
            href={`https://t.me/${link.value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send className="mr-2 h-5 w-5" /> {link.displayText}
          </a>
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* --- "CONTACT US" POPUP UPDATE KIYA GAYA --- */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-xs rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Contact Us</DialogTitle>
            <DialogDescription className="text-center">
              Humse niche diye gaye links se baat karein.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            {contactLoading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : publicContactLinks.length > 0 ? (
              // Database se mile links ko render karein
              publicContactLinks.map(renderContactButton)
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No contact links available right now.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* --- POPUP UPDATE KHATAM --- */}


      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <nav className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          {/* Brand Name (Left) - Waisa hi hai */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Package size={24} className="text-primary" />
              <span className="text-xl font-bold text-primary">clyroo</span>
            </Link>
          </div>

          {/* --- NAYA DESKTOP NAVLINKS (MIDDLE) --- */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/inquiry" className={navLinkClass}>
              Order Inquiry
            </NavLink>
            <NavLink to="/how-to-buy" className={navLinkClass}>
              How to Buy
            </NavLink>
            {/* Yeh button "Contact Us" popup kholega */}
            <Button variant="ghost" className={navLinkClass({ isActive: false })} onClick={() => setIsContactOpen(true)}>
              Contact Us
            </Button>
          </div>
          {/* --- DESKTOP NAVLINKS KHATAM --- */}


          {/* Icons (Right) - Desktop ke liye */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search icon yahaan se hata diya gaya hai */}

            {/* Admin Panel Button */}
            <Link to="/login">
              <Button variant="outline" size="icon">
                <UserCog className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Go to Admin Panel</span>
              </Button>
            </Link>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>

          {/* --- NAYA MOBILE HAMBURGER ICON --- */}
          <div className="md:hidden">
            <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
          {/* --- MOBILE ICON KHATAM --- */}

        </nav>
      </header>

      {/* --- NAYA MOBILE MENU (BOTTOM SHEET) --- */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 w-full overflow-hidden bg-background p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out dark:shadow-[0_-10px_30px_-15px_rgba(255,255,255,0.1)]",
          isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="container mx-auto max-w-md">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
            className="absolute top-4 right-4"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>

          <div className="flex flex-col gap-5 pt-4">
            <NavLink
              to="/inquiry"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              Order Inquiry
            </NavLink>
            <NavLink
              to="/how-to-buy"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              How to Buy
            </NavLink>

            {/* Aapne kaha tha "Contact Us" blue button jaisa dikhega */}
            <Button className="w-full mt-2" onClick={openContactPopup}>
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      {/* --- MOBILE MENU KHATAM --- */}


      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/order/success/:id" element={<OrderSuccessPage />} />
          <Route path="/inquiry" element={<OrderInquiryPage />} />
          <Route path="/how-to-buy" element={<HowToBuyPage />} /> {/* <-- Naya route add kiya */}

          {/* Payment Routes */}
          <Route path="/order/:id/pay" element={<PaymentSelectPage />} />
          <Route path="/order/:id/confirm" element={<ConfirmationPage />} />
          <Route path="/order/:id/nowpayments" element={<NowPaymentsPage />} />

          {/* Admin Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Admin Route */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

        </Routes>
      </main>

    </div>
  );
}

export default App;