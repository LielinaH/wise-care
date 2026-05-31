'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ClipboardList, 
  GitBranch, 
  Compass, 
  FileText, 
  Send, 
  CheckCircle, 
  Inbox, 
  Settings, 
  ShieldCheck, 
  BarChart3, 
  ArrowLeft, 
  Menu, 
  X,
  Lock
} from 'lucide-react';
import { storage } from '@/lib/storage';
import DemoRoleSwitcher from './DemoRoleSwitcher';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  pill?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  crumbs?: string[];
  actions?: React.ReactNode;
}

export default function AppShell({ children, title, crumbs = [], actions }: AppShellProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>('user');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setRole(storage.getRole());
  }, [pathname]);

  const navs: Record<string, NavSection[]> = {
    user: [
      {
        label: 'Care Navigation',
        items: [
          { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
          { id: 'intake', label: 'Intake', href: '/intake', icon: ClipboardList },
          { id: 'care-route', label: 'Care route', href: '/care-route', icon: GitBranch },
          { id: 'matching', label: 'Support options', href: '/matching', icon: Compass },
          { id: 'care-packet', label: 'Care packet', href: '/care-packet', icon: FileText },
          { id: 'connection-request', label: 'Connection requests', href: '/connection-request', icon: Send },
          { id: 'follow-up', label: 'Follow-up', href: '/follow-up', icon: CheckCircle },
        ],
      },
    ],
    provider: [
      {
        label: 'Practice Panel',
        items: [
          { id: 'provider-dashboard', label: 'Dashboard', href: '/provider/dashboard', icon: Home },
          { id: 'provider-inbox', label: 'Referral inbox', href: '/provider/inbox', icon: Inbox, pill: '5' },
          { id: 'provider-register', label: 'Profile Settings', href: '/provider/register', icon: Settings },
        ],
      },
    ],
    admin: [
      {
        label: 'Operations',
        items: [
          { id: 'admin-dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { id: 'admin-verify', label: 'Provider verification', href: '/admin/verify', icon: ShieldCheck, pill: '3' },
        ],
      },
    ],
    org: [
      {
        label: 'Insights',
        items: [
          { id: 'org-insights', label: 'Anonymous trends', href: '/organization/insights', icon: BarChart3 },
        ],
      },
    ],
  };

  const sections = navs[role] || navs.user;

  // Determine which nav item is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <div className="brand-mark"></div>
        <div className="brand-word">
          Wise Care
          <small>Care Navigation</small>
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-4 flex-1">
        {sections.map((section, idx) => (
          <div key={idx} className="nav-section">
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const ActiveIcon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <ActiveIcon className="ico w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.pill && <span className="pill">{item.pill}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <DemoRoleSwitcher />
        <Link href="/" className="nav-item mt-2 text-xs text-wise-muted hover:text-wise-fg">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to landing
        </Link>
      </div>
    </>
  );

  return (
    <div className="app">
      {/* Mobile top bar */}
      <div className="mobile-bar">
        <div className="flex items-center gap-2.5">
          <div className="brand-mark"></div>
          <div className="brand-word">
            Wise Care
            <small>Care Navigation</small>
          </div>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer scrim */}
      <div
        className={`sidebar-scrim ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Close button inside mobile menu */}
        <button
          className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-wise-surface-sunk text-wise-muted"
          onClick={closeMobileMenu}
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main Panel */}
      <div className="main">
        <header className="topbar">
          <div>
            {crumbs.length > 0 && (
              <div className="topbar-crumbs">
                {crumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="sep">›</span>}
                    {idx === crumbs.length - 1 ? (
                      <span className="text-wise-fg font-medium">{crumb}</span>
                    ) : (
                      <span>{crumb}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <div className="topbar-title">
              {title}
            </div>
          </div>
          {actions && <div className="topbar-actions">{actions}</div>}
        </header>

        {/* Workspace Area */}
        <main className="workspace">
          {children}
        </main>
      </div>
    </div>
  );
}
