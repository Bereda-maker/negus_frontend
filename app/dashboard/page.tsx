'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Bell, Package, Heart, MessageCircle, ShoppingBag, Video, Radio, X, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSocket } from '@/services/socket';
import api from '@/services/api';
import productService from '@/services/productService';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/common/RequireAuth';
import ChatBox from '@/components/chat/ChatBox';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Product } from '@/types';
import '@/i18n';

// --- Types (unchanged) ---
interface Stream {
  isLive: boolean;
  streamKey?: string;
  [key: string]: unknown;
}

interface ChatListEntry {
  user: { _id: string; name: string; avatar?: { url: string } | null };
  lastMessage?: { text: string };
  unreadCount: number;
}

interface Withdrawal {
  _id: string;
  amount: number;
  status: 'approved' | 'rejected' | 'pending' | string;
  createdAt: string;
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  totalFavorites: number;
  listingsByCategory: { name: string; count: number }[];
}

// Period labels moved to translation keys – we no longer need this constant
// const PERIOD_LABELS = ...

function DashboardContent() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [allListings, setAllListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatList, setChatList] = useState<ChatListEntry[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const socket = getSocket();
  const messagesRef = useRef<HTMLDivElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);

  const [earnings, setEarnings] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [period, setPeriod] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    listingsByCategory: [],
  });

  const isVerifiedSeller = (user as any)?.isVerifiedSeller === true;
  const isSeller = user?.role === 'seller' || (user as any)?.isVerifiedSeller;

  // ---- Fetch functions (unchanged except error messages translated) ----
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [listingsRes, unreadRes, chatRes] = await Promise.all([
        productService.getMyListings({ limit: 100 }),
        api.get('/messages/unread/count'),
        api.get('/messages/chat-list'),
      ]);

      const listings = listingsRes.data;
      setAllListings(listings);
      const total = listings.length;
      const active = listings.filter((p) => p.status === 'active').length;
      const sold = listings.filter((p) => p.status === 'sold').length;
      const views = listings.reduce((sum, p) => sum + ((p.viewCount as number) || 0), 0);
      const favorites = listings.reduce((sum, p) => sum + ((p.favoritesCount as number) || 0), 0);
      const categoryMap: Record<string, number> = {};
      listings.forEach((p) => {
        const catName = (typeof p.category === 'object' && p.category?.name) || t('dashboard.uncategorized');
        categoryMap[catName] = (categoryMap[catName] || 0) + 1;
      });
      setStats({
        totalListings: total,
        activeListings: active,
        soldListings: sold,
        totalViews: views,
        totalFavorites: favorites,
        listingsByCategory: Object.entries(categoryMap).map(([name, count]) => ({ name, count })),
      });

      setUnreadCount(unreadRes.data.data.count);
      setChatList(chatRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(t('dashboard.errors.fetchDataFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchStreamStatus = useCallback(async () => {
    try {
      const res = await api.get('/live-stream/my-stream');
      if (res.data.data) {
        const s: Stream = res.data.data;
        setIsStreaming(s.isLive);
        if (s.isLive) {
          setStreamKey(s.streamKey || '');
          setRtmpUrl(`rtmp://localhost:1935/live/${s.streamKey}`);
        }
      }
    } catch {
      // no active stream
    }
  }, []);

  const fetchEarningsAndWithdrawals = useCallback(async (selectedPeriod: string) => {
    try {
      const [earnRes, withdrawRes] = await Promise.all([
        api.get(`/orders/earnings?period=${selectedPeriod}`),
        api.get('/orders/withdrawals/my'),
      ]);
      setEarnings(earnRes.data.total || 0);
      setWithdrawals(withdrawRes.data.data || []);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      toast.error(t('dashboard.errors.fetchEarningsFailed'));
    }
  }, [t]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/messages/unread/count');
      setUnreadCount(res.data.data.count);
    } catch {
      // ignore
    }
  }, []);

  const fetchChatList = useCallback(async () => {
    try {
      const res = await api.get('/messages/chat-list');
      setChatList(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  // ---- Effects (unchanged) ----
  useEffect(() => {
    fetchAllData();
    if (isVerifiedSeller) fetchStreamStatus();
    if (isSeller) fetchEarningsAndWithdrawals(period);

    if (socket) {
      socket.on('new_message', () => {
        fetchUnreadCount();
        fetchChatList();
      });
      socket.on('messages_read', () => {
        fetchUnreadCount();
        fetchChatList();
      });
    }
    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('messages_read');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerifiedSeller, isSeller]);

  useEffect(() => {
    if (isSeller) fetchEarningsAndWithdrawals(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSeller) {
        fetchEarningsAndWithdrawals(period);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSeller, period, fetchEarningsAndWithdrawals]);

  // ---- Handlers (toast messages translated) ----
  const scrollToMessages = () => {
    messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCardClick = (card: { link?: string }) => {
    if (card.link === '#messages') {
      scrollToMessages();
    } else if (card.link) {
      router.push(card.link);
    }
  };

  const handleGoLive = async () => {
    if (!isVerifiedSeller) {
      toast.error(t('dashboard.toasts.live.onlyVerified'));
      return;
    }
    setIsLiveLoading(true);
    try {
      const keyRes = await api.post('/live-stream/generate-key');
      const { streamKey: key, rtmpUrl: url } = keyRes.data.data;
      setStreamKey(key);
      setRtmpUrl(url);
      setShowStreamModal(true);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('dashboard.toasts.live.generateFailed'));
    } finally {
      setIsLiveLoading(false);
    }
  };

  const handleStartStream = async () => {
    if (!streamKey) return;
    setIsLiveLoading(true);
    try {
      await api.post('/live-stream/start', { streamKey });
      setIsStreaming(true);
      setShowStreamModal(false);
      toast.success(t('dashboard.toasts.live.started'));
      fetchStreamStatus();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('dashboard.toasts.live.startFailed'));
    } finally {
      setIsLiveLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (!streamKey) return;
    setIsLiveLoading(true);
    try {
      await api.post('/live-stream/end', { streamKey });
      setIsStreaming(false);
      toast.success(t('dashboard.toasts.live.ended'));
      fetchStreamStatus();
    } catch {
      toast.error(t('dashboard.toasts.live.endFailed'));
    } finally {
      setIsLiveLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!accountName || !accountNumber || !withdrawAmount || amount < 1000) {
      toast.error(t('dashboard.toasts.withdraw.invalidFields'));
      return;
    }
    if (amount > earnings) {
      toast.error(t('dashboard.toasts.withdraw.exceedsEarnings'));
      return;
    }
    setIsWithdrawing(true);
    try {
      await api.post('/orders/withdrawals/request', { amount, accountName, accountNumber });
      toast.success(t('dashboard.toasts.withdraw.success'));
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setAccountName('');
      setAccountNumber('');
      await fetchEarningsAndWithdrawals(period);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('dashboard.toasts.withdraw.failed'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRefreshEarnings = async () => {
    setIsRefreshing(true);
    await fetchEarningsAndWithdrawals(period);
    setIsRefreshing(false);
    toast.success(t('dashboard.toasts.earningsRefreshed'));
  };

  // ---- Render ----
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Quick action cards with translated titles
  const quickActionCards = [
    { title: t('dashboard.quickActions.sell'), color: 'bg-primary text-white', link: '/sell', icon: Package },
    { title: t('dashboard.quickActions.myListings'), color: 'bg-gold text-white', link: '/my-listings', icon: Package },
    { title: t('dashboard.quickActions.favorites'), color: 'bg-primary-light text-white', link: '/favorites', icon: Heart },
    {
      title: t('dashboard.quickActions.messages'),
      color: 'bg-gold-light text-primary',
      link: '#messages',
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { title: t('dashboard.quickActions.myOrders'), color: 'bg-primary-light text-white', link: '/orders', icon: ShoppingBag },
    ...(isSeller ? [{ title: t('dashboard.quickActions.sellerOrders'), color: 'bg-gold-light text-primary', link: '/seller-orders', icon: ShoppingBag, badge: null }] : []),
  ];

  // Period labels from translation
  const periodKeys = ['all', 'today', 'week', 'month', '3months', '6months', 'year'];
  const periodLabels: Record<string, string> = {};
  periodKeys.forEach((key) => {
    periodLabels[key] = t(`dashboard.periodLabels.${key}`);
  });

  return (
    <div className="min-h-screen bg-warm-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary flex items-center gap-2">
              {t('dashboard.welcome', { name: user?.name || t('dashboard.defaultName') })}
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">{unreadCount}</span>
              )}
            </h1>
            <p className="text-textSecondary mt-1">{t('dashboard.subtitle')}</p>
          </div>
        </div>

        {isVerifiedSeller && (
          <div className="mb-8">
            <div className={`rounded-card p-6 border ${isStreaming ? 'bg-red-50 border-red-500' : 'bg-surface border-border'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                  <h3 className="text-lg font-bold text-primary">
                    {isStreaming ? t('dashboard.live.liveNow') : t('dashboard.live.title')}
                  </h3>
                  {isStreaming && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t('dashboard.live.badge')}</span>}
                </div>
                {isStreaming ? (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-textSecondary">
                      {t('dashboard.live.streamKey')}: <span className="font-mono text-gold">{streamKey}</span>
                    </span>
                    <span className="text-sm text-textSecondary">
                      RTMP: <span className="font-mono text-gold break-all">{rtmpUrl}</span>
                    </span>
                    <Button variant="danger" size="sm" onClick={handleEndStream} isLoading={isLiveLoading}>
                      <X className="h-4 w-4 mr-1" /> {t('dashboard.live.endStream')}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleGoLive} isLoading={isLiveLoading} className="bg-red-500 hover:bg-red-600 text-white">
                    <Video className="h-4 w-4 mr-1" /> {t('dashboard.live.goLive')}
                  </Button>
                )}
              </div>
              {isStreaming && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-border">
                  <p className="text-xs text-textSecondary">{t('dashboard.live.activeNote')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isSeller && (
          <div className="bg-surface rounded-card shadow-card p-6 border border-border mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">{t('dashboard.earnings.title')}</h3>
                <p className="text-2xl font-bold text-gold">{earnings.toFixed(2)} ETB</p>
                <p className="text-sm text-textSecondary">{t('dashboard.earnings.subtitle')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1">
                  {periodKeys.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                        period === p ? 'bg-gold text-white' : 'bg-warm-bg text-textSecondary hover:bg-gold/20'
                      }`}
                    >
                      {periodLabels[p]}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshEarnings}
                  isLoading={isRefreshing}
                  className="border-gold text-gold hover:bg-gold hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> {t('dashboard.earnings.refresh')}
                </Button>
                <Button
                  onClick={() => {
                    if (earnings >= 1000) {
                      setShowWithdrawModal(true);
                    } else {
                      toast.error(t('dashboard.toasts.withdraw.minimum'));
                    }
                  }}
                  disabled={earnings < 1000}
                  variant="primary"
                  className={`bg-gold hover:bg-gold-dark text-white ${earnings < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('dashboard.earnings.requestWithdrawal')}
                </Button>
              </div>
            </div>
            {withdrawals.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-medium text-primary">{t('dashboard.earnings.withdrawalHistory')}</p>
                {withdrawals.slice(0, 5).map((w) => (
                  <div key={w._id} className="flex justify-between text-sm text-textSecondary border-b border-border py-1">
                    <span>{w.amount} ETB</span>
                    <span
                      className={`capitalize ${
                        w.status === 'approved' ? 'text-green-600' : w.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    >
                      {t(`dashboard.statuses.${w.status}`)}
                    </span>
                    <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {quickActionCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(card)}
              className={`${card.color} rounded-card shadow-card hover:shadow-cardHover transition-all duration-200 p-6 flex items-center justify-center text-center transform hover:scale-104 relative cursor-pointer`}
            >
              <span className="font-medium text-sm sm:text-base flex items-center gap-2">
                {card.icon && <card.icon className="h-4 w-4" />}
                {card.title}
                {card.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {card.badge}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: t('dashboard.stats.totalListings'), value: stats.totalListings },
            { label: t('dashboard.stats.active'), value: stats.activeListings },
            { label: t('dashboard.stats.sold'), value: stats.soldListings },
            { label: t('dashboard.stats.views'), value: stats.totalViews },
            { label: t('dashboard.stats.favorites'), value: stats.totalFavorites },
          ].map((metric, idx) => (
            <div key={idx} className="bg-surface rounded-card shadow-card p-4 flex flex-col items-center justify-center border border-border">
              <div className="text-2xl font-bold text-primary">{metric.value}</div>
              <div className="text-xs text-textSecondary">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface rounded-card shadow-card p-6 border border-border">
            <h2 className="text-lg font-semibold text-primary mb-4">{t('dashboard.charts.categoryTitle')}</h2>
            {stats.listingsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.listingsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" />
                  <XAxis dataKey="name" tick={{ fill: '#5a4f45' }} />
                  <YAxis tick={{ fill: '#5a4f45' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fdfaf5', borderColor: '#e8dfd4' }} />
                  <Bar dataKey="count" fill="#c9973b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-textSecondary text-sm">{t('dashboard.charts.noCategoryData')}</p>
            )}
          </div>
          <div className="bg-surface rounded-card shadow-card p-6 border border-border">
            <h2 className="text-lg font-semibold text-primary mb-4">{t('dashboard.charts.statusTitle')}</h2>
            {stats.totalListings > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t('dashboard.statuses.active'), value: stats.activeListings },
                      { name: t('dashboard.statuses.sold'), value: stats.soldListings },
                      { name: t('dashboard.statuses.other'), value: Math.max(0, stats.totalListings - stats.activeListings - stats.soldListings) },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {['#0a1428', '#c9973b', '#1a2d4f'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fdfaf5', borderColor: '#e8dfd4' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-textSecondary text-sm">{t('dashboard.charts.noStatusData')}</p>
            )}
          </div>
        </div>

        <div ref={messagesRef} className="bg-surface rounded-card shadow-card border border-border overflow-hidden mb-8 scroll-mt-20">
          <div className="px-6 py-4 border-b border-border bg-cream flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold" />
              {t('dashboard.messages.title')}
              {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} {t('dashboard.messages.unread')}</span>}
            </h2>
          </div>
          {chatList.length === 0 ? (
            <div className="p-6 text-center text-textSecondary">{t('dashboard.messages.noConversations')}</div>
          ) : (
            <div className="divide-y divide-border">
              {chatList.map((chat) => (
                <div
                  key={chat.user._id}
                  className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-cream transition"
                  onClick={() => setSelectedChat(chat.user._id)}
                >
                  <Avatar src={chat.user.avatar?.url} name={chat.user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary">{chat.user.name}</p>
                    <p className="text-sm text-textSecondary truncate">{chat.lastMessage?.text || t('dashboard.messages.noMessages')}</p>
                  </div>
                  {chat.unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{chat.unreadCount}</span>}
                </div>
              ))}
            </div>
          )}
          {selectedChat && (
            <div className="p-4 border-t border-border">
              <ChatBox userId={selectedChat} onClose={() => setSelectedChat(null)} />
            </div>
          )}
        </div>

        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-cream">
            <h2 className="text-lg font-semibold text-primary">{t('dashboard.recentListings.title')}</h2>
            <Link href="/my-listings" className="text-gold hover:text-gold-dark text-sm font-medium">
              {t('dashboard.recentListings.viewAll')} →
            </Link>
          </div>
          {allListings.length === 0 ? (
            <div className="p-6 text-center text-textSecondary">
              {t('dashboard.recentListings.empty')}
              <Link href="/sell" className="block mt-2 text-gold hover:underline font-medium">
                {t('dashboard.recentListings.createFirst')} →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {allListings.slice(0, 5).map((listing) => (
                <div key={listing._id} className="px-6 py-4 flex flex-wrap items-center justify-between hover:bg-cream transition">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {listing.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.images[0].url} alt={listing.title} className="w-14 h-14 object-cover rounded-card" />
                    ) : (
                      <div className="w-14 h-14 bg-border rounded-card flex items-center justify-center text-textTertiary">{t('dashboard.recentListings.noImage')}</div>
                    )}
                    <div className="truncate">
                      <Link href={`/product/${listing._id}`} className="font-medium text-primary hover:text-gold transition">
                        {listing.title}
                      </Link>
                      <div className="text-sm text-textSecondary">
                        {listing.city} • {listing.price} ETB •{' '}
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-pill ${
                            listing.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'sold'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {t(`dashboard.statuses.${listing.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <span className="text-sm text-textTertiary">{(listing.viewCount as number) || 0} {t('dashboard.recentListings.views')}</span>
                    <Link
                      href={`/listing/${listing._id}/edit`}
                      className="text-gold hover:text-gold-dark text-sm border border-gold px-3 py-1 rounded-button hover:bg-gold hover:text-white transition"
                    >
                      {t('dashboard.recentListings.edit')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-textSecondary border-t border-border pt-6">
          {t('dashboard.tip')}
        </div>
      </div>

      {/* Stream Modal */}
      {showStreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">{t('dashboard.modal.stream.title')}</h2>
              <button onClick={() => setShowStreamModal(false)} className="text-textSecondary hover:text-primary transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-warm-bg rounded-xl border border-border">
                <p className="text-sm text-textSecondary">{t('dashboard.modal.stream.streamKeyLabel')}</p>
                <p className="text-sm font-mono text-gold break-all">{streamKey}</p>
              </div>
              <div className="p-4 bg-warm-bg rounded-xl border border-border">
                <p className="text-sm text-textSecondary">{t('dashboard.modal.stream.rtmpLabel')}</p>
                <p className="text-sm font-mono text-gold break-all">{rtmpUrl}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">{t('dashboard.modal.stream.instructions')}</p>
              </div>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={handleStartStream} isLoading={isLiveLoading}>
                <Radio className="h-4 w-4 mr-2" /> {t('dashboard.modal.stream.startButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">{t('dashboard.modal.withdraw.title')}</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-textSecondary hover:text-primary transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {t('dashboard.modal.withdraw.amountLabel', { earnings: earnings.toFixed(2) })}
                </label>
                <input
                  type="number"
                  min="1000"
                  max={earnings}
                  value={withdrawAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0) setWithdrawAmount(e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  placeholder={t('dashboard.modal.withdraw.amountPlaceholder', { max: Math.floor(earnings) })}
                />
                <p className="text-xs text-textSecondary mt-1">{t('dashboard.modal.withdraw.minimum')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">{t('dashboard.modal.withdraw.accountNameLabel')}</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  placeholder={t('dashboard.modal.withdraw.accountNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">{t('dashboard.modal.withdraw.accountNumberLabel')}</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  placeholder={t('dashboard.modal.withdraw.accountNumberPlaceholder')}
                />
              </div>
              <Button
                className="w-full bg-gold hover:bg-gold-dark text-white"
                onClick={handleWithdraw}
                isLoading={isWithdrawing}
                disabled={
                  !withdrawAmount ||
                  Number(withdrawAmount) < 1000 ||
                  Number(withdrawAmount) > earnings ||
                  !accountName.trim() ||
                  !accountNumber.trim()
                }
              >
                {t('dashboard.modal.withdraw.submitButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}