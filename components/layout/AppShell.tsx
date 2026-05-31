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

      <div className="mt-auto">
        <DemoRoleSwitcher />
        <Link href="/" className="nav-item mt-2 text-xs text-wise-muted hover:text-wise-fg">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to landing
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-height-screen bg-wise-bg text-wise-fg flex flex-col">
      {/* Mobile top bar */}
      <div className="mobile-bar md:hidden flex items-center justify-between p-4 border-b border-wise-hairline bg-wise-surface">
        <div className="flex items-center gap-2.5">
          <div className="brand-mark w-7 h-7"></div>
          <div className="brand-word text-sm">Wise Care</div>
        </div>
        <button
          className="mobile-menu-btn w-9 h-9 border border-wise-border rounded-xl flex items-center justify-center text-wise-fg-soft"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer scrim */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-scrim fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside
          className={`sidebar fixed md:sticky top-0 left-0 w-[268px] h-screen bg-wise-surface border-r border-wise-hairline p-5 flex flex-col gap-5 z-50 transition-transform duration-300 md:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="topbar hidden md:flex items-center justify-between px-8 py-4 border-b border-wise-hairline bg-wise-bg/82 backdrop-blur-md sticky top-0 z-30">
            <div>
              {crumbs.length > 0 && (
                <div className="topbar-crumbs flex items-center gap-2 text-xs text-wise-muted">
                  {crumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="sep text-wise-border-2">›</span>}
                      {idx === crumbs.length - 1 ? (
                        <span className="text-wise-fg-soft font-medium">{crumb}</span>
                      ) : (
                        <span className="hover:text-wise-fg cursor-default">{crumb}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <div className="topbar-title text-base font-semibold tracking-tight text-wise-fg mt-0.5">
                {title}
              </div>
            </div>
            {actions && <div className="topbar-actions flex items-center gap-2">{actions}</div>}
          </header>

          {/* Workspace Area */}
          <main className="workspace p-5 md:p-8 max-w-[1280px] w-full mx-auto flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
