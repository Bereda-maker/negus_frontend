// components/Navbar.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Menu, X, User, LogOut, LayoutDashboard, Shield, Heart, Plus, Search,
  Globe, ChevronDown, Truck, RotateCcw, Headphones, Package, ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { useTranslation } from 'react-i18next';
import '@/i18n'; // initialise i18n

// --- Language definitions ---
const languages = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo' },
  { code: 'sid', label: 'Sidaamu Afoo' },
  { code: 'wal', label: 'Wolayita' },
  { code: 'ti', label: 'ትግርኛ' },
];

// --- Types ---
interface MenuLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

interface MobileLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}

// --- Component ---
export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const q = formData.get('q') as string;

    if (q && q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push('/search');
    }
    setMobileOpen(false);
  };

  // Change language and persist choice
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setLangOpen(false);
  };

  const navItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.marketplace'), path: '/search' },
    { label: t('nav.reels'), path: '/reels' },
    { label: t('nav.blog'), path: '/blog' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="bg-primary text-white/80 text-[10px] sm:text-xs py-2 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="hidden sm:flex items-center gap-4 md:gap-6">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t('topbar.freeShipping')}
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t('topbar.returns')}
            </span>
            <span className="flex items-center gap-1.5">
              <Headphones className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t('topbar.support')}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-white/80 hover:text-white transition group"
              >
                <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">
                  {languages.find(l => l.code === i18n.language)?.label || 'English'}
                </span>
                <span className="xs:hidden">{i18n.language?.toUpperCase()}</span>
                <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 group-hover:rotate-180 transition" />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 z-[9999] mt-2 w-32 sm:w-36 rounded-lg border border-white/10 bg-primary/95 backdrop-blur-md py-1 shadow-xl">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm transition ${
                          i18n.language === lang.code
                            ? 'text-gold font-semibold bg-white/5'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-white/20 shadow-md transition-all duration-500">
        <div className="mx-auto flex h-[64px] sm:h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/assets/images/logo.jpg"
              alt="Negus Gebeya"
              width={44}
              height={44}
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl object-contain bg-gradient-to-br from-[#f7f0e7] to-[#ede4d8] p-1 shadow-md transition-transform duration-500 hover:scale-105 hover:-rotate-2"
            />
            <span className="font-playfair text-base sm:text-xl font-extrabold tracking-tight">
              Negus <span className="text-gold">Gebeya</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-6 xl:gap-10 md:flex">
            {navItems.map(({ label, path }) => {
              const active = isLinkActive(path);
              return (
                <li key={label}>
                  <Link
                    href={path}
                    className={`text-sm font-medium text-textSecondary transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-gold/60 after:to-gold after:transition-all after:duration-300 hover:after:w-full ${
                      active ? 'text-primary after:w-full' : ''
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <form onSubmit={handleSearch} className="hidden flex-1 items-center justify-end md:flex md:max-w-xs xl:max-w-sm">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
              <input
                type="search"
                name="q"
                placeholder={t('nav.searchPlaceholder')}
                className="w-full rounded-full border-0 bg-white/60 py-2 pl-10 pr-4 text-sm text-textPrimary placeholder:text-textTertiary/70 shadow-inner ring-1 ring-black/5 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-gold/50 focus:outline-none"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push('/sell')}
                  className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-gold text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(201,151,59,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,151,59,0.5)] active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('nav.sell')}</span>
                </button>

                <Link
                  href="/favorites"
                  className="hidden md:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-textSecondary transition-all duration-300 hover:bg-gold/10 hover:text-gold hover:scale-110"
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 rounded-full p-0.5 sm:p-1 pr-1.5 sm:pr-2 transition-all duration-300 hover:bg-white/50"
                  >
                    <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-48 sm:w-52 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-md py-1.5 shadow-xl">
                        <p className="truncate px-4 py-2 text-sm font-semibold text-primary">{user?.name}</p>
                        <div className="my-1 border-t border-border/50" />
                        <MenuLink href="/profile" icon={User} label={t('nav.profile')} onClick={() => setMenuOpen(false)} />
                        <MenuLink href="/my-listings" icon={Package} label={t('nav.myListings')} onClick={() => setMenuOpen(false)} />
                        <MenuLink href="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} onClick={() => setMenuOpen(false)} />
                        <MenuLink href="/orders" icon={ShoppingBag} label={t('nav.myOrders')} onClick={() => setMenuOpen(false)} />
                        {user?.role === 'seller' && (
                          <MenuLink href="/seller-orders" icon={ShoppingBag} label={t('nav.sellerOrders')} onClick={() => setMenuOpen(false)} />
                        )}
                        {user?.role === 'admin' && (
                          <MenuLink href="/admin" icon={Shield} label={t('nav.adminPanel')} onClick={() => setMenuOpen(false)} />
                        )}
                        <div className="my-1 border-t border-border/50" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/5"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-textSecondary transition-all duration-300 hover:text-gold hover:scale-105"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-amber-400 to-gold text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(201,151,59,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,151,59,0.5)] active:scale-95"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}

            <button
              className="md:hidden p-1.5 sm:p-2 rounded-md text-primary transition-colors duration-300 hover:bg-white/50"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/20 bg-white/95 backdrop-blur-md px-4 py-3 md:hidden max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
                <input
                  type="search"
                  name="q"
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full rounded-full border-0 bg-white/60 py-2 pl-10 pr-4 text-sm text-textPrimary placeholder:text-textTertiary/70 shadow-inner focus:ring-2 focus:ring-gold/50 focus:outline-none"
                />
              </div>
            </form>

            <div className="flex flex-col gap-1">
              {navItems.map(({ label, path }) => (
                <MobileLink key={label} href={path} onClick={() => setMobileOpen(false)}>
                  {label}
                </MobileLink>
              ))}

              {isAuthenticated ? (
                <>
                  <MobileLink href="/sell" onClick={() => setMobileOpen(false)}>{t('nav.sell')}</MobileLink>
                  <MobileLink href="/my-listings" onClick={() => setMobileOpen(false)}>{t('nav.myListings')}</MobileLink>
                  <MobileLink href="/favorites" onClick={() => setMobileOpen(false)}>{t('nav.favorites')}</MobileLink>
                  <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</MobileLink>
                  <MobileLink href="/orders" onClick={() => setMobileOpen(false)}>{t('nav.myOrders')}</MobileLink>
                  {user?.role === 'seller' && (
                    <MobileLink href="/seller-orders" onClick={() => setMobileOpen(false)}>{t('nav.sellerOrders')}</MobileLink>
                  )}
                  {user?.role === 'admin' && (
                    <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>{t('nav.adminPanel')}</MobileLink>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="rounded-button px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/5"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <MobileLink href="/login" onClick={() => setMobileOpen(false)}>{t('nav.login')}</MobileLink>
                  <MobileLink href="/register" onClick={() => setMobileOpen(false)}>{t('nav.signup')}</MobileLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

// --- Sub-components ---
function MenuLink({ href, icon: Icon, label, onClick }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary transition-colors hover:bg-gold/5"
    >
      <Icon className="h-4 w-4 text-textTertiary" />
      {label}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: MobileLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-button px-3 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-gold/10 text-gold shadow-sm'
          : 'text-primary hover:bg-white/50'
      }`}
    >
      {children}
    </Link>
  );
}