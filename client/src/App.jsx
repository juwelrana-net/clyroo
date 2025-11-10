// client/src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
import OrderInquiryPage from './pages/OrderInquiryPage.jsx'; // <-- Naya page import karein
import { Package, UserCog, Search } from 'lucide-react'; // <-- Search icon import karein
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { Button } from '@/components/ui/button.jsx';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <nav className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          {/* Brand Name (Left) */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2"> {/* Link yahaan add kiya */}
              <Package size={24} className="text-primary" />
              <span className="text-xl font-bold text-primary">clyroo</span>
            </Link>
          </div>

          {/* Icons (Right) */}
          <div className="flex items-center gap-2">

            {/* --- NAYA INQUIRY BUTTON --- */}
            <Link to="/inquiry">
              <Button variant="outline" size="icon">
                <Search className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Order Inquiry</span>
              </Button>
            </Link>
            {/* --- BUTTON KHATAM --- */}

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
        </nav>
      </header>

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/order/success/:id" element={<OrderSuccessPage />} />
          <Route path="/inquiry" element={<OrderInquiryPage />} /> {/* <-- Naya route add karein */}

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