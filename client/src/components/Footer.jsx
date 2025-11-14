// client/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        // Yeh hai aapka rounded container jiske baahar margin hai (my-8)
        <footer className="bg-secondary/30 border border-border rounded-lg p-6 md:p-10 my-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Column 1: Logo & Address */}
                <div className="space-y-4">
                    <Link to="/" className="flex items-center gap-2">
                        <Package size={24} className="text-primary" />
                        <span className="text-xl font-bold text-primary">clyroo</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Aapka trusted digital goods marketplace.
                    </p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                        <span>
                            123 Digital Street, <br />
                            Internet City, Web 00000
                        </span>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
                    <ul className="space-y-2">
                        <li><Link to="/how-to-buy" className="text-sm text-muted-foreground hover:text-primary">How to Buy</Link></li>
                        <li><Link to="/inquiry" className="text-sm text-muted-foreground hover:text-primary">Order Inquiry</Link></li>
                    </ul>
                </div>

                {/* Column 3: Legal */}
                <div>
                    <h4 className="font-semibold text-foreground mb-3">Legal & Info</h4>
                    <ul className="space-y-2">
                        <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
                        <li><Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary">Refund Policy</Link></li>
                    </ul>
                </div>

                {/* Column 4: Socials */}
                <div>
                    <h4 className="font-semibold text-foreground mb-3">Follow Us</h4>
                    <div className="flex gap-4">
                        <a href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></a>
                        <a href="#" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></a>
                        <a href="#" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></a>
                    </div>
                </div>

            </div>

            {/* Copyright section */}
            <div className="border-t border-border/50 mt-8 pt-6 text-center">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} clyroo. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;