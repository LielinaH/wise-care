'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  Info,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
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
  const router = useRouter();
  const { role, signOut, isFirebaseMode } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navs: Record<string, NavSection[]> = {
    patient: [
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
    provider_org: [
      {
        label: 'Practice Panel (Clinic)',
        items: [
          { id: 'org-dashboard', label: 'Dashboard', href: '/provider/org/dashboard', icon: Home },
          { id: 'provider-inbox', label: 'Referral inbox', href: '/provider/inbox', icon: Inbox },
          { id: 'org-register', label: 'Profile Settings', href: '/provider/org/register', icon: Settings },
        ],
      },
    ],
    solo_provider: [
      {
        label: 'Practice Panel (Solo)',
        items: [
          { id: 'solo-dashboard', label: 'Dashboard', href: '/provider/solo/dashboard', icon: Home },
          { id: 'provider-inbox', label: 'Referral inbox', href: '/provider/inbox', icon: Inbox },
          { id: 'solo-register', label: 'Profile Settings', href: '/provider/solo/register', icon: Settings },
        ],
      },
    ],
    admin: [
      {
        label: 'Operations',
        items: [
          { id: 'admin-dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { id: 'admin-accounts', label: 'Account Database', href: '/admin/accounts', icon: Users },
          { id: 'admin-verify', label: 'Provider verification', href: '/admin/verify', icon: ShieldCheck },
          { id: 'org-insights', label: 'Organization insights', href: '/organization/insights', icon: BarChart3 },
        ],
      },
    ],
  };

  const sections = navs[role as string] || navs.patient;

  // Determine which nav item is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (e) {
      console.error('Logout failed: ', e);
    }
  };

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
        
        <button 
          onClick={handleSignOut} 
          className="nav-item text-xs w-full hover:bg-rose-50 text-rose-700 font-semibold"
          style={{ cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left', display: 'flex', gap: '8px', padding: '8px 12px', borderRadius: '8px', marginTop: '10px' }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>

        <Link href="/" className="nav-item mt-1.5 text-xs text-wise-muted hover:text-wise-fg">
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
        {!isFirebaseMode && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'oklch(96.2% 0.015 195)', padding: '10px 24px', borderBottom: '1px solid var(--hairline)', fontSize: '12.5px', color: 'oklch(40% 0.08 195)' }}>
            <Info className="w-4.5 h-4.5 shrink-0" />
            <span>
              Running in <strong>Local Storage Fallback Mode</strong>. Add Firebase credentials in <code>.env.local</code> to enable true database authentication.
            </span>
          </div>
        )}
        
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
