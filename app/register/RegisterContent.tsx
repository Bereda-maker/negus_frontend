'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, X, Eye, EyeOff, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ETHIOPIAN_CITIES } from '@/utils/constants';
import { socialLogin } from '@/services/authService';
import '@/i18n';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

export default function RegisterContent() {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const password = watch('password', '');

  const calculateStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordStrength(calculateStrength(e.target.value));
  };

  const onSubmit = async (formValues: RegisterFormValues) => {
    setServerError('');
    if (!termsAccepted) {
      toast.error(t('register.toasts.termsRequired'));
      return;
    }
    try {
      const payload: Partial<RegisterFormValues> = { ...formValues };
      if (!payload.phone) delete payload.phone;
      if (!payload.city) delete payload.city;

      await registerUser(payload);
      toast.success(t('register.toasts.welcome'));
      router.replace(from);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      setServerError(message || t('register.toasts.createFailed'));
    }
  };

  const handleClose = () => {
    router.push(from);
  };

  const handleGoogleLogin = () => {
    setSocialLoading(true);
    toast(t('register.toasts.redirectingGoogle'));
    socialLogin('google');
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return t('register.passwordStrength.weak');
    if (passwordStrength < 70) return t('register.passwordStrength.fair');
    return t('register.passwordStrength.strong');
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
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
          aria-label={t('register.closeAria')}
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
                alt={t('register.logoAlt')}
                width={96}
                height={96}
                className="w-24 h-24 mx-auto mb-6 rounded-full object-cover border-4 border-white/20 shadow-lg"
              />
              <h1 className="font-playfair text-3xl font-extrabold mb-2">Negus Gebeya</h1>
              <p className="text-white/80 text-sm max-w-xs mx-auto">
                {t('register.leftColumnTagline')}
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
                alt={t('register.logoAlt')}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-gold"
              />
              <div>
                <h2 className="font-playfair text-xl font-bold text-primary">Negus Gebeya</h2>
                <p className="text-textSecondary text-xs">{t('register.mobileSubtitle')}</p>
              </div>
            </div>

            <h2 className="hidden md:block font-playfair text-2xl font-bold text-primary">{t('register.title')}</h2>
            <p className="hidden md:block text-textSecondary text-sm mb-6">
              {t('register.subtitle')}
            </p>

            {serverError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm border border-red-200">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('register.form.namePlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm"
                  {...register('name', {
                    required: t('register.form.nameRequired'),
                    minLength: { value: 2, message: t('register.form.nameMinLength') },
                    maxLength: { value: 60, message: t('register.form.nameMaxLength') },
                  })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder={t('register.form.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm"
                  {...register('email', {
                    required: t('register.form.emailRequired'),
                    pattern: { value: /^\S+@\S+\.\S+$/, message: t('register.form.emailInvalid') },
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('register.form.passwordPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm"
                  {...register('password', {
                    required: t('register.form.passwordRequired'),
                    minLength: { value: 8, message: t('register.form.passwordMinLength') },
                    pattern: { value: /\d/, message: t('register.form.passwordNumberRequired') },
                  })}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                {password && passwordStrength < 100 && (
                  <p className="text-xs text-gray-500 mt-1">{getStrengthLabel()}</p>
                )}
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder={t('register.form.phonePlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm"
                  {...register('phone', {
                    validate: (value) =>
                      !value || /^(\+251|0)[97]\d{8}$/.test(value) || t('register.form.phoneInvalid'),
                  })}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                <p className="text-xs text-gray-500 mt-1">{t('register.form.phoneHelp')}</p>
              </div>

              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition outline-none text-sm appearance-none"
                  {...register('city')}
                >
                  <option value="">{t('register.form.cityDefault')}</option>
                  {ETHIOPIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                    termsAccepted ? 'bg-gold border-gold text-white' : 'border-gray-300 bg-white'
                  }`}
                >
                  {termsAccepted && <Check className="h-4 w-4" />}
                </button>
                <label className="text-sm text-gray-600">
                  {t('register.form.termsLabel')}{' '}
                  <a href="#" className="text-gold hover:underline">
                    {t('register.form.termsLink')}
                  </a>{' '}
                  {t('register.form.and')}{' '}
                  <a href="#" className="text-gold hover:underline">
                    {t('register.form.privacyLink')}
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-white font-bold text-base shadow-lg shadow-gold/30 hover:shadow-gold/50 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('register.form.creating') : t('register.form.submitButton')}
              </button>

              <div className="mt-4">
                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-500">{t('register.form.orSignUp')}</span>
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
                  {t('register.form.googleButton')}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                {t('register.form.alreadyAccount')}{' '}
                <Link href={`/login?from=${encodeURIComponent(from)}`} className="text-gold font-bold hover:underline">
                  {t('register.form.loginLink')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}