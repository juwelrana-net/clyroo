// client/src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import PaymentSelectPage from './pages/PaymentSelectPage.jsx';
import NowPaymentsPage from './pages/NowPaymentsPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import OrderInquiryPage from './pages/OrderInquiryPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import RefundPolicyPage from './pages/RefundPolicyPage.jsx';
import HowToBuyPage from './pages/HowToBuyPage.jsx';

import { Package, UserCog, Menu, X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.jsx";
import { cn } from './lib/utils.js';
import api from './lib/api.js';
import Footer from './components/Footer.jsx';
import { Toaster } from 'sonner';

// --- NAYE ADMIN IMPORTS ---
import AdminLayout from './layouts/AdminLayout.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import ProductsPage from './pages/admin/ProductsPage.jsx';
import StocksPage from './pages/admin/StocksPage.jsx';
import PaymentsPage from './pages/admin/PaymentsPage.jsx';
import CategoriesPage from './pages/admin/CategoriesPage.jsx';
import ContactsPage from './pages/admin/ContactsPage.jsx';
import NotificationsPage from './pages/admin/NotificationsPage.jsx';
import AdminControlPage from './pages/admin/AdminControlPage.jsx';

const AppContentComponent = (props) => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) {
    return null;
  }
  const {
    isMobileMenuOpen, setIsMobileMenuOpen, isContactOpen, setIsContactOpen,
    publicContactLinks, contactLoading, closeMobileMenu, openContactPopup,
    navLinkClass, renderContactButton
  } = props;
  return (
    <>
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
              publicContactLinks.map(renderContactButton)
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No contact links available.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <nav className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Package size={24} className="text-primary" />
              <span className="text-xl font-bold text-primary">clyroo</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/inquiry" className={navLinkClass}>
              Order Inquiry
            </NavLink>
            <NavLink to="/how-to-buy" className={navLinkClass}>
              How to Buy
            </NavLink>
            <Button variant="ghost" className={navLinkClass({ isActive: false })} onClick={() => setIsContactOpen(true)}>
              Contact Us
            </Button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" size="icon">
                <UserCog className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Go to Admin Panel</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </nav>
      </header>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 w-full overflow-hidden bg-background p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out dark:shadow-[0_-10px_30px_-15px_rgba(255,255,255,0.1)]",
          isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="container mx-auto max-w-md">
          <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="absolute top-4 right-4">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex flex-col gap-5 pt-4">
            <NavLink to="/inquiry" className={navLinkClass} onClick={closeMobileMenu}>
              Order Inquiry
            </NavLink>
            <NavLink to="/how-to-buy" className={navLinkClass} onClick={closeMobileMenu}>
              How to Buy
            </NavLink>
            <Button className="w-full mt-2" onClick={openContactPopup}>
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
const AppFooterComponent = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <div className="container mx-auto max-w-7xl px-4">
      <Footer />
    </div>
  );
};
function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [publicContactLinks, setPublicContactLinks] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  useEffect(() => {
    const fetchPublicContacts = async () => {
      setContactLoading(true);
      try {
        const res = await api.get('/api/contact');
        setPublicContactLinks(res.data);
      } catch (err) {
        console.error("Public contact links fetch nahi ho paye", err);
      } finally {
        setContactLoading(false);
      }
    };
    fetchPublicContacts();
  }, []);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openContactPopup = () => {
    closeMobileMenu();
    setIsContactOpen(true);
  };
  const navLinkClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground"
    );
  const renderContactButton = (link) => {
    if (link.type === 'whatsapp') {
      return (
        <Button key={link._id} asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
          <a href={`httpshttps://wa.me/${link.value}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> {link.displayText}
          </a>
        </Button>
      );
    }
    if (link.type === 'telegram') {
      return (
        <Button key={link._id} asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          <a href={`httpshttps://t.me/${link.value}`} target="_blank" rel="noopener noreferrer">
            <Send className="mr-2 h-5 w-5" /> {link.displayText}
          </a>
        </Button>
      );
    }
    return null;
  };
  const contentProps = {
    isMobileMenuOpen, setIsMobileMenuOpen, isContactOpen, setIsContactOpen,
    publicContactLinks, contactLoading, closeMobileMenu, openContactPopup,
    navLinkClass, renderContactButton
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <Toaster richColors position="top-center" />
      
      <AppContentComponent {...contentProps} />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/order/success/:id" element={<OrderSuccessPage />} />
          <Route path="/inquiry" element={<OrderInquiryPage />} />
          <Route path="/how-to-buy" element={<HowToBuyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/order/:id/pay" element={<PaymentSelectPage />} />
          <Route path="/order/:id/confirm" element={<ConfirmationPage />} />
          <Route path="/order/:id/nowpayments" element={<NowPaymentsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="stocks" element={<StocksPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />

              {/* --- YEH NAYA ROUTE ADD HUA HAI --- */}
              <Route path="admincontrol" element={<AdminControlPage />} />
              {/* --- NAYA ROUTE KHATAM --- */}

            </Route>
          </Route>
        </Routes>
      </main>

      <AppFooterComponent />
    </div>
  );
}

export default App;