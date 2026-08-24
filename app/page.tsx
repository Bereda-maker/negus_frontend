'use client';

import { useEffect, useState, useRef, useCallback, useMemo, MouseEvent } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, Sparkles, TrendingUp,
  Star, StarHalf, ChevronRight, LayoutGrid,
  UserPlus, Search,
  ChevronLeft, Heart, Eye,
  Truck, RotateCcw, Lock, Medal, Compass
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import favoriteService from '@/services/favoriteService';
import { blogService, BlogPost } from '@/services/blogService';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Product, Category } from '@/types';

// ===== Category image mapping - LOCAL IMAGES =====
const categoryImages: Record<string, string> = {
  Vehicles: '/assets/images/vehicles.webp',
  Property: '/assets/images/property.webp',
  'Phones & Tablets': '/assets/images/phone.webp',
  Electronics: '/assets/images/electronics.webp',
  'Home, Furniture & Appliances': '/assets/images/furniture.jpg',
  Fashion: '/assets/images/fashion.webp',
  'Beauty & Personal Care': '/assets/images/beauty.webp',
  'Repair & Construction': '/assets/images/construction.webp',
  'Commercial Equipment & Tools': '/assets/images/equip.webp',
  'Leisure & Activities': '/assets/images/leisure.webp',
  'Babies & Kids': '/assets/images/kids.webp',
  'Food, Agriculture & Farming': '/assets/images/food.webp',
};

const FALLBACK_IMAGE = '/assets/images/placeholder.jpg';

// ---------- Custom Hooks ----------
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    const node = ref.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
  return isInView;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ---------- Showcase Carousel ----------
function ShowcaseSlider({ products }: { products: Product[] }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = products.length;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = (index: number) => setCurrentIndex(index);
  const nextSlide = useCallback(() => setCurrentIndex((i) => (i + 1) % total), [total]);
  const prevSlide = useCallback(() => setCurrentIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (isPaused || total === 0) return;
    intervalRef.current = setInterval(nextSlide, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, total, nextSlide]);

  if (total === 0) return null;

  return (
    <div
      className="relative w-full max-w-[450px] mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured products showcase"
    >
      <div className="relative w-full aspect-square md:aspect-[1/1.1] perspective-1200">
        {products.map((product, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={product._id}
              className={`absolute inset-0 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 transition-all duration-700 ease-in-out ${
                isActive ? 'opacity-100 scale-100 z-10 pointer-events-auto' : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary/Unsplash URL, arbitrary crop inside an absolutely-positioned slide */}
              <img
                src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'}
                alt={product.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <span className="inline-block bg-gold text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 shadow-md">
                  {(product as any).isFeatured ? t('home.staffPick') : t('home.newArrival')}
                </span>

                <h3 className="font-playfair text-lg sm:text-2xl font-bold text-white leading-snug mb-1 truncate">
                  {product.title}
                </h3>

                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gold-light font-bold text-base sm:text-lg">{product.price} ETB</span>
                  {(product as any).originalPrice && (
                    <span className="text-white/40 text-xs sm:text-sm line-through">{(product as any).originalPrice} ETB</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-gold text-xs sm:text-sm mb-4">
                  {[...Array(5)].map((_, i) => {
                    const rating = (product as any).rating || 0;
                    if (i < Math.floor(rating)) return <Star key={i} className="h-3.5 w-3.5 fill-current" />;
                    if (i === Math.floor(rating) && rating % 1 > 0) return <StarHalf key={i} className="h-3.5 w-3.5 fill-current" />;
                    return <Star key={i} className="h-3.5 w-3.5 text-white/20" />;
                  })}
                  <span className="text-white/40 text-xs ml-1">({(product as any).reviewCount || 0})</span>
                </div>

                <Link
                  href={`/product/${product._id}`}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-gold hover:bg-white text-white hover:text-primary rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-gold/20"
                >
                  {t('home.viewDetails')} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-3 mt-5">
        <button onClick={prevSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition" aria-label="Previous">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-gold shadow-[0_0_10px_rgba(201,151,59,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
        <button onClick={nextSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition" aria-label="Next">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------- Trust Callout ----------
function TrustCallout({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/10 hover:shadow-xl hover:shadow-gold/5 flex flex-col items-center justify-center"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="inline-flex p-3 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors duration-300 mb-2.5">
          <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
        </div>
        <h3 className="text-white font-semibold text-sm sm:text-base">{title}</h3>
        <p className="text-white/60 text-xs sm:text-sm leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}

// ---------- FAQ Item (accordion) ----------
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex justify-between items-center text-left font-medium text-primary hover:bg-warm-bg/50 transition"
      >
        <span>{question}</span>
        <ChevronRight className={`h-5 w-5 text-textSecondary transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <div className="px-5 pb-4 text-textSecondary text-sm border-t border-border/50">{answer}</div>}
    </div>
  );
}

// ---------- 10% Discount Banner ----------
function DiscountBanner() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 3);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const diff = expiry.getTime() - now;
      if (diff <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isExpired) return null;

  return (
    <section className="py-12 bg-cream">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-primary text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-primary via-primary-light to-[#1f1410] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-64 h-64 rounded-full bg-gold/10 top-10 left-10 animate-pulse" />
            <div className="absolute w-96 h-96 rounded-full bg-gold/10 bottom-10 right-10 animate-pulse delay-500" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <span className="text-gold-light text-sm font-bold uppercase tracking-wider">{t('discount.badge')}</span>
            <h2 className="font-playfair text-2xl md:text-3xl font-extrabold mt-1">
              {t('discount.title')} <span className="text-gold-light">{t('discount.percent')}</span>
            </h2>
            <p className="text-white/70 text-sm mt-1">{t('discount.description')}</p>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <span className="block text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-xs text-white/60">{t('discount.days')}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <span className="block text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-white/60">{t('discount.hours')}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <span className="block text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-white/60">{t('discount.mins')}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <span className="block text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-white/60">{t('discount.secs')}</span>
              </div>
            </div>
            <Link href="/register" className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-full font-bold shadow-lg transition">
              {t('discount.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Main Home Component ----------
export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // ✅ now we keep the product array
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [showcaseProducts, setShowcaseProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // 🔥 Fetch ALL products (limit: 100) so we can count correctly
        const [productsAllRes, categoriesRes, blogRes] = await Promise.all([
          productService.getProducts({ sort: 'newest', limit: 100 } as any),
          categoryService.getCategories(),
          blogService.getPosts({ limit: 3 }).catch(() => ({ data: { data: [] as BlogPost[] } }) as any),
        ]);
        if (!isMounted) return;

        // ✅ Compute product counts per category
        const categoriesWithCount = categoriesRes.data.map((cat: Category) => ({
          ...cat,
          productCount: productsAllRes.data.filter(
            (p: any) => p.category === cat._id || p.category?._id === cat._id
          ).length,
        }));

        setProducts(productsAllRes.data);
        setCategories(categoriesWithCount);
        setBlogPosts(blogRes.data?.data || []);
        setShowcaseProducts(productsAllRes.data.slice(0, 5));

        // 🔥 Use the same list for trending (first 4) – you can also fetch separately
        setTrendingProducts(productsAllRes.data.slice(0, 4));
      } catch (error) {
        console.error('Home fetch error:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    favoriteService
      .getMyFavorites({ limit: 100 })
      .then((res) => setFavoritedIds(new Set(res.data.map((f: any) => f.product?._id || f.product))))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleToggleFavorite = async (product: Product) => {
    const isFav = favoritedIds.has(product._id);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(product._id) : next.add(product._id);
      return next;
    });
    try {
      if (isFav) {
        await favoriteService.removeFavorite(product._id);
      } else {
        await favoriteService.addFavorite(product._id);
      }
    } catch {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(product._id) : next.delete(product._id);
        return next;
      });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error(t('newsletter.error'));
      return;
    }
    setIsSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail });
      toast.success(t('newsletter.success'));
      setNewsletterEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('newsletter.fail'));
    } finally {
      setIsSubscribing(false);
    }
  };

  const bgPattern =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjOTk3M2IiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEE0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=';

  return (
    <div className="bg-cream">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary-light to-[#1f1410] text-white py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-72 h-72 rounded-full bg-gold/5 top-10 -left-20 animate-pulse" />
          <div className="absolute w-96 h-96 rounded-full bg-gold/5 bottom-10 -right-20 animate-pulse delay-700" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${bgPattern})` }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gold/15 backdrop-blur-sm border border-gold/30 px-4 py-1.5 rounded-full text-gold-light text-xs font-semibold uppercase tracking-wider shadow-lg shadow-gold/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
                </span>
                {t('hero.badge')}
              </div>

              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">{t('hero.title')}</h1>

              <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">{t('hero.subtitle')}</p>

              <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start pt-1">
                <Link
                  href="/search"
                  className="group inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Search className="h-4 w-4" />
                  {t('hero.browse')}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-7 py-3.5 rounded-full font-semibold text-sm backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {t('hero.sell')}
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 mt-8">
                <TrustCallout icon={ShieldCheck} title={t('trust.verified')} description={t('trust.verifiedDesc')} delay={0} />
                <TrustCallout icon={Sparkles} title={t('trust.ai')} description={t('trust.aiDesc')} delay={100} />
                <TrustCallout icon={TrendingUp} title={t('trust.pricing')} description={t('trust.pricingDesc')} delay={200} />
              </div>
            </div>

            <div className="lg:col-span-5 w-full flex justify-center">
              <ShowcaseSlider products={showcaseProducts} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 text-cream">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60H360C240 60 120 60 60 60H0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* ===== CATEGORIES (Cinematic Magazine Flow) ===== */}
      {categories.length > 0 && (
        <AnimatedSection className="py-12 bg-cream overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-gold/20">
                  <LayoutGrid className="h-3.5 w-3.5" /> {t('categories.shop')}
                </span>
                <h2 className="font-playfair text-2xl font-bold text-primary mt-1">{t('categories.title')}</h2>
              </div>
              <Link href="/search" className="text-gold hover:text-gold-dark text-sm font-medium flex items-center gap-1">
                {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ---- ROW 1: Large image left + two stacked on right ---- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {categories[0] && (
                <Link
                  href={`/search?category=${categories[0]._id}`}
                  className="md:col-span-2 relative h-64 md:h-80 rounded-2xl overflow-hidden group shadow-card hover:shadow-xl transition"
                >
                  <img
                    src={categoryImages[categories[0].name] || FALLBACK_IMAGE}
                    alt={categories[0].name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                    onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h3 className="font-playfair text-2xl md:text-3xl font-bold">{categories[0].name}</h3>
                    <p className="text-white/70 text-sm">{(categories[0] as any).productCount || 0} {t('common.items')}</p>
                  </div>
                </Link>
              )}
              <div className="flex flex-col gap-4">
                {[1, 2].map((idx) => {
                  const cat = categories[idx];
                  if (!cat) return null;
                  return (
                    <Link
                      key={cat._id}
                      href={`/search?category=${cat._id}`}
                      className="relative h-32 md:h-[152px] rounded-2xl overflow-hidden group shadow-card hover:shadow-xl transition flex-1"
                    >
                      <img
                        src={categoryImages[cat.name] || FALLBACK_IMAGE}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                        onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h4 className="font-bold text-base">{cat.name}</h4>
                        <p className="text-white/70 text-xs">{(cat as any).productCount || 0} {t('common.items')}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ---- ROW 2: Three equal pillars ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {[3, 4, 5].map((idx) => {
                const cat = categories[idx];
                if (!cat) return null;
                return (
                  <Link
                    key={cat._id}
                    href={`/search?category=${cat._id}`}
                    className="relative h-56 md:h-64 rounded-2xl overflow-hidden group shadow-card hover:shadow-xl transition"
                  >
                    <img
                      src={categoryImages[cat.name] || FALLBACK_IMAGE}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                      onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h4 className="font-bold text-lg">{cat.name}</h4>
                      <p className="text-white/70 text-sm">{(cat as any).productCount || 0} {t('common.items')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ---- ROW 3: Full‑width panoramic banner ---- */}
            {categories[6] && (
              <Link
                href={`/search?category=${categories[6]._id}`}
                className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden group shadow-card hover:shadow-xl transition mb-4 block"
              >
                <img
                  src={categoryImages[categories[6].name] || FALLBACK_IMAGE}
                  alt={categories[6].name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                  onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="font-playfair text-2xl md:text-3xl font-bold">{categories[6].name}</h3>
                  <p className="text-white/70 text-sm">{(categories[6] as any).productCount || 0} {t('common.items')}</p>
                </div>
              </Link>
            )}

            {/* ---- ROW 4: Split dual cards ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[7, 8].map((idx) => {
                const cat = categories[idx];
                if (!cat) return null;
                return (
                  <Link
                    key={cat._id}
                    href={`/search?category=${cat._id}`}
                    className="relative h-56 md:h-72 rounded-2xl overflow-hidden group shadow-card hover:shadow-xl transition"
                  >
                    <img
                      src={categoryImages[cat.name] || FALLBACK_IMAGE}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                      onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h4 className="font-bold text-xl">{cat.name}</h4>
                      <p className="text-white/70 text-sm">{(cat as any).productCount || 0} {t('common.items')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ---- ROW 5: Three equal pillars (final) ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[9, 10, 11].map((idx) => {
                const cat = categories[idx];
                if (!cat) return null;
                return (
                  <Link
                    key={cat._id}
                    href={`/search?category=${cat._id}`}
                    className="relative h-56 md:h-64 rounded-2xl overflow-hidden group shadow-card hover:shadow-xl transition"
                  >
                    <img
                      src={categoryImages[cat.name] || FALLBACK_IMAGE}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                      onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h4 className="font-bold text-lg">{cat.name}</h4>
                      <p className="text-white/70 text-sm">{(cat as any).productCount || 0} {t('common.items')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ===== TRENDING PRODUCTS ===== */}
      <section className="py-12 bg-warm-bg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="inline-block bg-gold text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                {t('trending.badge')}
              </span>
              <h2 className="font-playfair text-2xl font-bold text-primary mt-1">{t('trending.title')}</h2>
            </div>
            <Link href="/search?sort=views" className="text-gold hover:text-gold-dark text-sm font-medium flex items-center gap-1">
              {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-card hover:shadow-cardHover transition border border-border overflow-hidden group">
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Cloudinary/Unsplash thumbnail */}
                    <img
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full">{t('trending.badge')}</div>
                    {isAuthenticated && (
                      <button
                        onClick={(e: MouseEvent) => {
                          e.preventDefault();
                          handleToggleFavorite(product);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition"
                        aria-label={favoritedIds.has(product._id) ? t('common.removeFav') : t('common.addFav')}
                      >
                        <Heart className={`h-4 w-4 ${favoritedIds.has(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary truncate">{product.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gold font-bold">{product.price} ETB</span>
                      <div className="flex items-center gap-1 text-textSecondary text-xs">
                        <Eye className="h-3 w-3" />
                        {(product as any).viewCount || 0}
                      </div>
                    </div>
                    <Link
                      href={`/product/${product._id}`}
                      className="mt-3 block text-center text-sm border border-gold text-gold hover:bg-gold hover:text-white px-3 py-1.5 rounded-full transition"
                    >
                      {t('common.viewDetails')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textSecondary text-center py-8">{t('trending.empty')}</p>
          )}
        </div>
      </section>

      {/* ===== 10% DISCOUNT BANNER ===== */}
      {!isAuthenticated && <DiscountBanner />}

      {/* ===== NEWSLETTER ===== */}
      <section className="py-12 bg-warm-bg">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-border shadow-card">
            <h3 className="text-lg font-bold text-primary mb-2">{t('newsletter.title')}</h3>
            <p className="text-textSecondary text-sm mb-4">{t('newsletter.subtitle')}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('newsletter.placeholder') as string}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full border border-border focus:border-gold focus:outline-none transition"
                required
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-gold hover:bg-gold-dark text-white px-6 py-2 rounded-full font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? t('newsletter.subscribing') : t('newsletter.subscribe')}
              </button>
            </form>
            <label className="flex items-center gap-2 mt-3 text-xs text-textSecondary">
              <input type="checkbox" required /> {t('newsletter.privacy')}
            </label>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-4">{t('instagram.title')}</h3>
            <div className="grid grid-cols-4 gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=300&q=80" alt="instagram" className="aspect-square object-cover rounded-lg" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80" alt="instagram" className="aspect-square object-cover rounded-lg" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=300&q=80" alt="instagram" className="aspect-square object-cover rounded-lg" />
              <div className="aspect-square rounded-lg bg-primary text-white flex flex-col items-center justify-center text-center p-2">
                <span className="text-xs font-bold">@negusgebeya</span>
                <button className="mt-1 bg-white text-primary text-[10px] font-bold px-3 py-1 rounded-full">{t('instagram.follow')}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      {blogPosts.length > 0 && (
        <section className="py-12 bg-cream">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-block bg-gold text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">{t('blog.badge')}</span>
                <h2 className="font-playfair text-2xl font-bold text-primary mt-1">{t('blog.title')}</h2>
              </div>
              <Link href="/blog" className="text-gold hover:text-gold-dark text-sm font-medium flex items-center gap-1">
                {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {blogPosts.map((post) => (
                <div key={post._id} className="bg-white rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-cardHover transition group">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS-supplied cover, falls back to a remote placeholder */}
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80'}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="p-5">
                    <span className="text-xs text-textSecondary">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <h4 className="font-semibold text-primary mt-1 line-clamp-2">{post.title}</h4>
                    <p className="text-sm text-textSecondary mt-1 line-clamp-2">{post.excerpt || post.body?.slice(0, 120)}</p>
                    <Link
                      href={`/blog/${post.slug || post._id}`}
                      className="text-gold text-sm font-medium inline-flex items-center gap-1 mt-2 hover:text-gold-dark transition"
                    >
                      {t('blog.readMore')} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      <section className="py-12 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="font-playfair text-2xl font-bold text-primary mb-5 text-center">{t('faq.title')}</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: t('faq.q1'), a: t('faq.a1') },
              { q: t('faq.q2'), a: t('faq.a2') },
              { q: t('faq.q3'), a: t('faq.a3') },
              { q: t('faq.q4'), a: t('faq.a4') },
              { q: t('faq.q5'), a: t('faq.a5') },
            ].map((item, idx) => (
              <FAQItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <div className="bg-warm-bg border-y border-border py-6">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <Lock className="h-7 w-7 text-gold mx-auto mb-1" />
            <h5 className="font-bold text-primary text-sm">{t('trustStrip.secure')}</h5>
            <p className="text-xs text-textSecondary">{t('trustStrip.secureDesc')}</p>
          </div>
          <div>
            <RotateCcw className="h-7 w-7 text-gold mx-auto mb-1" />
            <h5 className="font-bold text-primary text-sm">{t('trustStrip.returns')}</h5>
            <p className="text-xs text-textSecondary">{t('trustStrip.returnsDesc')}</p>
          </div>
          <div>
            <Medal className="h-7 w-7 text-gold mx-auto mb-1" />
            <h5 className="font-bold text-primary text-sm">{t('trustStrip.quality')}</h5>
            <p className="text-xs text-textSecondary">{t('trustStrip.qualityDesc')}</p>
          </div>
          <div>
            <Truck className="h-7 w-7 text-gold mx-auto mb-1" />
            <h5 className="font-bold text-primary text-sm">{t('trustStrip.delivery')}</h5>
            <p className="text-xs text-textSecondary">{t('trustStrip.deliveryDesc')}</p>
          </div>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <section className="relative py-20 bg-gradient-to-br from-primary via-primary-light to-[#1f1410] text-white text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-72 h-72 rounded-full bg-gold/5 top-10 left-10 animate-pulse" />
          <div className="absolute w-96 h-96 rounded-full bg-gold/5 bottom-10 right-10 animate-pulse delay-500" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${bgPattern})` }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm border border-gold/30 px-4 py-1.5 rounded-full text-gold-light text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
              </span>
              {t('cta.badge')}
            </div>

            <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold leading-tight">{t('cta.title')}</h2>

            <p className="text-white/70 text-sm sm:text-base">{t('cta.subtitle')}</p>

            <div className="pt-2 flex flex-wrap justify-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <UserPlus className="h-4 w-4" /> {t('cta.signup')}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-full font-semibold text-sm backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                {t('cta.login')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 text-[#fdfaf5]">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 40L60 36C120 32 240 24 360 20C480 16 600 16 720 18C840 20 960 24 1080 26C1200 28 1320 28 1380 28L1440 28V40H1380C1320 40 1200 40 1080 40H360C240 40 120 40 60 40H0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}