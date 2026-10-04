import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Lock, MapPin, Bell, HelpCircle, Mail } from 'lucide-react';

const Footer = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;

  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight">
                  Campus<span className="text-primary">Find</span>
                </span>
                <span className="text-[9px] font-semibold text-neutral-400 tracking-wider uppercase">
                  Campus Lost & Found Portal
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              CampusFind is a secure campus Lost & Found portal that helps students report lost items, register found items, discover potential matches, and recover belongings through real-time campus alerts.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-neutral-400 pt-1">
              <span className="flex items-center text-xs text-neutral-400 gap-1">
                <Shield className="w-3.5 h-3.5 text-primary" /> Verified Students
              </span>
              <span className="flex items-center text-xs text-neutral-400 gap-1">
                <Lock className="w-3.5 h-3.5 text-green-500" /> Private Claims
              </span>
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-4">
              EXPLORE
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/browse?type=LOST" className="hover:text-primary transition-colors">
                  Browse Lost Items
                </Link>
              </li>
              <li>
                <Link to="/browse?type=FOUND" className="hover:text-primary transition-colors">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-primary transition-colors">
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-primary transition-colors">
                  Report Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-4">
              PLATFORM
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/matches" className="hover:text-primary transition-colors">
                  Potential Matches
                </Link>
              </li>
              <li>
                <Link to="/campus-alerts" className="hover:text-primary transition-colors">
                  Live Alerts
                </Link>
              </li>
              <li>
                <Link to="/claims" className="hover:text-primary transition-colors">
                  Claims & Recovery
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* CAMPUS & SECURITY & TRUST */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">
                CAMPUS
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400 mb-4">
                <li>
                  <Link to="/campus-map" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Campus Locations
                  </Link>
                </li>
                <li>
                  <Link to="/campus-alerts" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-primary" />
                    Campus Alerts
                  </Link>
                </li>
                <li>
                  <Link to="/account-status" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    Lost & Found Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-2">
                SECURITY & TRUST
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                CampusFind is designed for verified campus students and authorized administrators. Reports and recovery actions are managed through secure campus workflows.
              </p>
              <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-[11px] text-neutral-300">
                <span className="font-semibold text-primary block mb-0.5">Contact Administrator</span>
                {supportEmail ? (
                  <span className="text-neutral-400">{supportEmail}</span>
                ) : (
                  <span className="text-neutral-400">Contact your campus administrator for support.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} CampusFind. All rights reserved.</p>
          <div className="flex space-x-6 text-[11px]">
            <Link to="/account-status" className="hover:text-neutral-400 transition-colors">
              Campus Guidelines
            </Link>
            <span className="text-neutral-600">•</span>
            <span className="hover:text-neutral-400 cursor-default">Student Privacy Policy</span>
            <span className="text-neutral-600">•</span>
            <span className="hover:text-neutral-400 cursor-default">Terms of Campus Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
