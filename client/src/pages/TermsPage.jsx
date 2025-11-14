// client/src/pages/TermsPage.jsx

import React from 'react';

// Chhota helper component taaki text likhna aasaan ho
const Section = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-3">{title}</h2>
        <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
);

const TermsPage = () => {
    return (
        // Humne max-w-3xl use kiya hai taaki text padhne mein aasaan ho
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-4xl font-extrabold text-center text-primary mb-10">
                Terms & Conditions
            </h1>

            <Section title="1. Introduction">
                <p>
                    Welcome to clyroo ("Company", "we", "our", "us")! These Terms of
                    Service ("Terms") govern your use of our website located at
                    [Aapki Website ka URL] (together or individually "Service")
                    operated by clyroo.
                </p>
                <p>
                    Please read these Terms carefully before using our Service. By
                    accessing or using the Service, you agree to be bound by these
                    Terms. If you disagree with any part of the terms, then you may not
                    access the Service.
                </p>
            </Section>

            <Section title="2. Use of Service">
                <p>
                    You agree to use our Service only for lawful purposes and in a way
                    that does not infringe the rights of, restrict, or inhibit anyone
                    else's use and enjoyment of the Service.
                </p>
                <p>
                    All products sold on this store are for development and testing use
                    only, and are prohibited from being used for illegal and criminal
                    activities.
                </p>
            </Section>

            <Section title="3. Products and Sales">
                <p>
                    We sell digital goods in the form of account credentials and
                    other digital items. All products are delivered automatically after
                    payment confirmation.
                </p>
                <p>
                    Please read the product description carefully before purchasing.
                    All sales are final except as provided in our Refund Policy.
                </p>
            </Section>

            <Section title="4. Warranty and Refunds">
                <p>
                    Our warranty rules are clearly stated on the product page and home
                    page. The default warranty is 1 hour for the first successful
                    power-on, unless stated otherwise.
                </p>
                <p>
                    Please review our <strong>Refund Policy</strong> for detailed
                    information on when a refund or replacement may be granted.
                </p>
            </Section>

            <Section title="5. Limitation of Liability">
                <p>
                    Our Service and all products are provided "as is" without any
                    warranty of any kind. Cloud accounts can be unstable; you agree
                    to bear this risk yourself when purchasing. We are not liable for
                    any damages that may occur from the use of our products.
                </p>
            </Section>

            <Section title="6. Changes to Terms">
                <p>
                    We reserve the right, at our sole discretion, to modify or replace
                    these Terms at any time. We will provide notice of any changes by
                    posting the new Terms on this site.
                </p>
            </Section>
        </div>
    );
};

export default TermsPage;