'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const publicLinks = [
  { href: '/', label: 'Home' },
];

const userLinks = [
  { href: '/decision/new', label: 'New decision' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const links = user ? [...publicLinks, ...userLinks] : publicLinks;
  if (user?.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="site-brand" href="/">
          Decision Intelligence Agent
        </Link>
        <nav className="site-links">
          {links.map((link) => (
            <Link
              key={link.href}
              className={`site-link ${pathname === link.href ? 'active' : ''}`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          {loading ? (
            <span className="tag">Loading</span>
          ) : user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="button ghost" type="button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="button ghost" href="/auth/login">
                Sign in
              </Link>
              <Link className="button primary" href="/auth/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
