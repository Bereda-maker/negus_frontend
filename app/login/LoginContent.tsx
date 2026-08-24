'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, X, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { socialLogin } from '@/services/authService';
import '@/i18n';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginContent() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (formValues: LoginFormValues) => {
    setServerError('');
    try {
      await login(formValues);
      toast.success(t('login.toasts.welcomeBack'));
      router.replace(from);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      setServerError(message || t('login.errors.incorrectCredentials'));
    }
  };

  const handleClose = () => {
    router.push(from);
  };

  const handleGoogleLogin = () => {
    setSocialLoading(true);
    toast(t('login.toasts.redirectingGoogle'));
    socialLogin('google');
  };

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          aria-label={t('login.closeAria')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Column – Illustration */}
          <div className="hidden md:flex md:w-2/5 bg-primary text-white p-8 flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEE0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />

            <div className="relative z-10">
              <Image
                src="/assets/images/logo.jpg"
                alt={t('login.logoAlt')}
                width={96}
                height={96}
                className="w-24 h-24 mx-auto mb-6 rounded-full object-cover border-4 border-white/20 shadow-lg"
              />
              <h1 className="font-playfair text-3xl font-extrabold mb-2">Negus Gebeya</h1>
              <p className="text-white/80 text-sm max-w-xs mx-auto">
                {t('login.leftColumnTagline')}
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center animate-pulse">
                  <span className="text-4xl">🏛️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column – Form */}
          <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto max-h-[90vh]">
            <div className="md:hidden flex items-center gap-3 mb-6">
              <Image
                src="/assets/images/logo.jpg"
                alt={t('login.logoAlt')}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-gold"
              />
              <div>
                <h2 className="font-playfair text-xl font-bold text-primary">Negus Gebeya</h2>
                <p className="text-textSecondary text-xs">{t('login.mobileSubtitle')}</p>
              </div>
            </div>

            <h2 className="hidden md:block font-playfair text-2xl font-bold text-primary">{t('login.title')}</h2>
            <p className="hidden md:block text-textSecondary text-sm mb-6">
              {t('login.subtitle')}
            </p>

            {serverError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm border border-red-200">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder={t('login.form.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm"
                  {...register('email', {
                    required: t('login.form.emailRequired'),
                    pattern: { value: /^\S+@\S+\.\S+$/, message: t('login.form.emailInvalid') },
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.form.passwordPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm"
                  {...register('password', { required: t('login.form.passwordRequired') })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-gold hover:underline">
                  {t('login.form.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-white font-bold text-base shadow-lg shadow-gold/30 hover:shadow-gold/50 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('login.form.loggingIn') : t('login.form.loginButton')}
              </button>

              <div className="mt-4">
                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-500">{t('login.form.orContinue')}</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={socialLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition text-sm font-medium text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent" />
                  ) : (
                    <Image src="/assets/images/google-logo.webp" alt="Google" width={20} height={20} className="w-5 h-5" />
                  )}
                  {t('login.form.googleButton')}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                {t('login.form.noAccount')}{' '}
                <Link href={`/register?from=${encodeURIComponent(from)}`} className="text-gold font-bold hover:underline">
                  {t('login.form.signUpLink')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}