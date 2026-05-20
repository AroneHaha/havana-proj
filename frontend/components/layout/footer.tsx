"use client";

import { MapPin, Phone, Mail, Clock, Camera, Video, MessageCircle, Music } from "lucide-react";

const quickLinks = [
  { label: "FAQ", href: "#" },
  { label: "Shipping Policy", href: "#" },
  { label: "Returns & Refunds", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const customerLinks = [
  { label: "Track Order", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "Corporate Orders", href: "#" },
];

const socialLinks = [
  { icon: Camera, label: "Instagram", href: "#" },
  { icon: MessageCircle, label: "Facebook", href: "#" },
  { icon: Music, label: "TikTok", href: "#" },
  { icon: Video, label: "YouTube", href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#080808] text-white">
      {/* Gold decorative border */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & About */}
          <div className="space-y-4">
            <span className="text-2xl font-serif font-bold text-gold-gradient">HAVANA</span>
            <p className="text-[10px] tracking-[0.3em] text-white/50 uppercase">Flowers</p>
            <p className="text-sm text-white/60 leading-relaxed">
              Havana Flowers is Qatar&apos;s premier luxury floral boutique, delivering exquisite
              arrangements crafted with passion and precision since 2018.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-gold hover:text-gold transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gold">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/60 hover:text-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gold">Customer Service</h3>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/60 hover:text-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gold">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">The Pearl-Qatar, Porto Arabia, Doha, Qatar</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <span className="text-sm text-white/60" dir="ltr">+974 4444 5555</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                <span className="text-sm text-white/60">hello@havanaflowers.qa</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gold flex-shrink-0" />
                <span className="text-sm text-white/60">Sat-Thu: 9AM - 10PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            &copy; {year} Havana Flowers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
