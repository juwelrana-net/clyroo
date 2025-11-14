// client/src/pages/RefundPolicyPage.jsx

import React from 'react';

// Chhota helper component
const Section = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-3">{title}</h2>
        <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
);

const RefundPolicyPage = () => {
    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-4xl font-extrabold text-center text-primary mb-10">
                Refund Policy
            </h1>

            <Section title="1. General Policy">
                <p>
                    Due to the digital nature of our products, **all sales are final**
                    and no refunds will be issued once a product has been delivered.
                </p>
                <p>
                    We do not offer refunds for non-product quality issues, such as
                    you changing your mind, ordering by mistake, or not knowing how to
                    use the product. Please read the product description carefully
                    before purchasing.
                </p>
            </Section>

            <Section title="2. Exceptions (Warranty)">
                <p>
                    A replacement or refund may be granted *only* if the product you
                    received is "Dead on Arrival" (DOA) or does not work as described
                    when you first receive it.
                </p>
                <p>
                    Our default warranty period is **1 hour for the first successful
                    power-on (login)**. You must check the credentials and report any
                    issues within this 1-hour window.
                </p>
                <p>
                    After this 1-hour warranty period, no refund or replacement will
                    be provided for any reason (including account suspension, blocks,
                    or instability).
                </p>
            </Section>

            <Section title="3. How to Request a Replacement">
                <p>
                    If your product is DOA, please contact our customer support
                    immediately (within the 1-hour warranty period) using the "Contact
                    Us" button on our website.
                </p>
                <p>
                    You will need to provide your Order ID and Access Token. We will
                    verify the issue and, if eligible, provide a replacement product.
                    If a replacement is not available, a refund may be issued to your
                    original payment method.
                </p>
            </Section>
        </div>
    );
};

export default RefundPolicyPage;