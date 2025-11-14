// client/src/pages/HowToBuyPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Mail, Wallet, Search, MessageCircle } from 'lucide-react';

/**
 * Ek reusable component jo har step ko ek card mein dikhata hai.
 * Yeh mobile par stack hota hai aur desktop par side-by-side.
 */
const StepCard = ({ stepNumber, title, children, imageUrl, imageAlt }) => {
    return (
        <li className="mb-16">
            {/* Step Title */}
            <div className="flex items-center mb-6">
                <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl">
                    {stepNumber}
                </span>
                <h3 className="text-3xl font-bold text-foreground ml-4">{title}</h3>
            </div>

            {/* Step Content (Text and Image) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                {/* Text Content */}
                <div className="lg:col-span-3 space-y-4 text-muted-foreground leading-relaxed text-base">
                    {children}
                </div>

                {/* Image Content */}
                <div className="lg:col-span-2 rounded-lg overflow-hidden border-2 border-border bg-secondary/30 p-2 shadow-lg">
                    <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center">
                        {/* IMPORTANT: Neeche di gayi line ko apne screenshot se replace karein.
              Example: <img src="/images/how-to-buy-1.png" alt={imageAlt} className="w-full rounded-md object-cover" />
            */}
                        <span className="text-sm text-muted-foreground p-4 text-center">
                            {imageUrl}
                        </span>
                    </div>
                </div>
            </div>
        </li>
    );
};


/**
 * Main "How to Buy" Page Component
 */
const HowToBuyPage = () => {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-16">
            <h1 className="text-5xl font-extrabold text-center text-primary mb-6">
                How to Buy
            </h1>
            <p className="text-center text-lg text-muted-foreground mb-20">
                Follow these simple steps to get your digital products instantly.
            </p>

            <ol>
                {/* --- STEP 1: SELECT PRODUCT --- */}
                <StepCard
                    stepNumber="1"
                    title="Select Your Product"
                    imageUrl=""
                    imageAlt="Product selection screen"
                >
                    <p>
                        First, find the product you want to buy from our homepage. On the
                        product page, you will need to provide two things:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>
                            <strong className="text-foreground">
                                <Mail size={16} className="inline-block mr-2" />
                                Your Email:
                            </strong>{' '}
                            This is where we will send your order confirmation and
                            credentials. Please double-check for typos.
                        </li>
                        <li>
                            <strong className="text-foreground">
                                <Wallet size={16} className="inline-block mr-2" />
                                Quantity:
                            </strong>{' '}
                            Choose how many items you wish to purchase.
                        </li>
                    </ul>
                    <p>
                        Once ready, click the "Proceed to Pay" button to continue.
                    </p>
                </StepCard>

                {/* --- STEP 2: CHOOSE PAYMENT --- */}
                <StepCard
                    stepNumber="2"
                    title="Choose Payment Method"
                    imageUrl=""
                    imageAlt="Cryptocurrency payment selection"
                >
                    <p>
                        Next, you will see a list of available cryptocurrencies you can
                        use to pay, such as <strong className="text-foreground">USDT (TRC20)</strong>,{' '}
                        <strong className="text-foreground">Bitcoin (BTC)</strong>, etc.
                    </p>
                    <p>
                        Select the coin you want to use and click "Submit Order" to see
                        the final confirmation page. After you confirm, you will be
                        taken to the payment invoice.
                    </p>
                </StepCard>

                {/* --- STEP 3: MAKE THE PAYMENT --- */}
                <StepCard
                    stepNumber="3"
                    title="Make the Payment"
                    imageUrl=""
                    imageAlt="Payment invoice with QR code"
                >
                    <p>
                        This is the most important step. You will see an invoice with:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>A QR Code</li>
                        <li>A specific wallet address</li>
                        <li>The exact amount of crypto to send</li>
                    </ul>
                    <p>
                        Send the <strong className="text-destructive">exact amount</strong>{' '}
                        to the <strong className="text-destructive">exact address</strong>.
                        Do not stay on this page for too long, as the invoice will
                        expire.
                    </p>
                    <p>
                        After you send the payment, just wait. Our system will
                        automatically detect the transaction (this can take a few
                        minutes). Once confirmed, you will be redirected to the "Order
                        Success" page.
                    </p>
                    <p className="font-bold text-primary">
                        On the success page, SAVE YOUR ORDER ID AND ACCESS TOKEN.
                    </p>
                </StepCard>

                {/* --- STEP 4: INQUIRY & SUPPORT --- */}
                <StepCard
                    stepNumber="4"
                    title="Order Inquiry & Support"
                    imageUrl=""
                    imageAlt="Order Inquiry and Support"
                >
                    <p>
                        If you lose your credentials or have a problem, we have two
                        ways to help you.
                    </p>

                    {/* Sub-section for Inquiry */}
                    <div className="mt-4 rounded-md border border-border bg-secondary/30 p-4">
                        <h4 className="font-semibold text-foreground flex items-center mb-2">
                            <Search size={18} className="inline-block mr-2" />
                            How to use Order Inquiry
                        </h4>
                        <p className="text-sm">
                            If you accidentally closed the success page, you can always
                            get your credentials back. Click the "Order Inquiry" link in
                            the website menu. Enter the{' '}
                            <strong className="text-foreground">Order ID</strong> and{' '}
                            <strong className="text-foreground">Access Token</strong> that
                            you saved in Step 3.
                        </p>
                    </div>

                    {/* Sub-section for Support */}
                    <div className="mt-4 rounded-md border border-border bg-secondary/30 p-4">
                        <h4 className="font-semibold text-foreground flex items-center mb-2">
                            <MessageCircle size={18} className="inline-block mr-2" />
                            How to Contact Support
                        </h4>
                        <p className="text-sm">
                            If your product is not working (DOA) or you have a payment
                            issue, click "Contact Us" in the menu. You can reach our
                            support team via WhatsApp or Telegram. Please have your
                            Order ID ready.
                        </p>
                    </div>
                </StepCard>
            </ol>
        </div>
    );
};

export default HowToBuyPage;