'use client';

import { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import RequireAuth from '@/components/common/RequireAuth';
import { Camera, CheckCircle, XCircle, Clock, Upload, X } from 'lucide-react';
import '@/i18n';

interface ProfileFormData {
  name: string;
  phone: string;
  city: string;
  bio: string;
}

interface Verification {
  status: 'not-submitted' | 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

function ProfileContent() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', phone: '', city: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('nationalId');
  const [verification, setVerification] = useState<Verification>({ status: 'not-submitted' });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: (user as any).phone || '',
        city: (user as any).city || '',
        bio: (user as any).bio || '',
      });
      setVerification((user as any).verification || { status: 'not-submitted' });
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocFile(file);
  };

  const handleClearDoc = () => {
    setDocFile(null);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      await api.patch('/users/me', formData);
      updateUser(formData);
      toast.success(t('profile.toasts.profileUpdated'));
      setIsEditing(false);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('profile.toasts.updateFailed'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || isUploadingAvatar) return;
    const uploadData = new FormData();
    uploadData.append('avatar', avatarFile);
    setIsUploadingAvatar(true);
    try {
      const res = await api.post('/users/avatar', uploadData);
      updateUser({ avatar: res.data.data.avatar });
      toast.success(t('profile.toasts.avatarUpdated'));
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('profile.toasts.avatarUploadFailed'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDocUpload = async () => {
    if (!docFile) {
      toast.error(t('profile.toasts.selectDocument'));
      return;
    }
    if (isUploadingDoc) return;
    const uploadData = new FormData();
    uploadData.append('document', docFile);
    uploadData.append('documentType', docType);
    setIsUploadingDoc(true);
    try {
      const res = await api.post('/users/verification', uploadData);
      setVerification(res.data.data);
      setDocFile(null);
      if (docInputRef.current) docInputRef.current.value = '';
      toast.success(t('profile.toasts.documentSubmitted'));
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('profile.toasts.documentUploadFailed'));
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        phone: (user as any).phone || '',
        city: (user as any).city || '',
        bio: (user as any).bio || '',
      });
    }
  };

  if (!user) return <div className="text-center py-10">{t('profile.loading')}</div>;

  const { status, rejectionReason } = verification;

  const getStatusDisplay = () => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: t('profile.verification.statuses.verified'),
          className: 'text-green-600',
        };
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          label: t('profile.verification.statuses.pending'),
          className: 'text-yellow-600',
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5" />,
          label: t('profile.verification.statuses.rejected'),
          className: 'text-red-600',
        };
      default:
        return {
          icon: null,
          label: t('profile.verification.statuses.notSubmitted'),
          className: 'text-textSecondary',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-2xl font-bold text-primary mb-6">{t('profile.title')}</h1>

        {/* Avatar Section */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-6 flex items-center gap-6 flex-wrap">
          <div className="relative">
            <Avatar src={avatarPreview || user.avatar?.url} name={user.name} size="xl" className="w-24 h-24" />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-gold rounded-full p-1.5 cursor-pointer hover:bg-gold-dark transition ${
                isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Camera className="h-4 w-4 text-white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isUploadingAvatar}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary">{user.name}</h3>
            <p className="text-textSecondary text-sm">{user.email}</p>
            {verification.status === 'verified' && (
              <span className="inline-flex items-center gap-1 text-gold text-sm font-medium mt-1">
                <CheckCircle className="h-4 w-4 fill-gold text-white" /> {t('profile.verification.verifiedBadge')}
              </span>
            )}
          </div>
          {avatarFile && (
            <Button size="sm" onClick={handleAvatarUpload} isLoading={isUploadingAvatar} disabled={isUploadingAvatar}>
              {isUploadingAvatar ? t('profile.avatar.uploading') : t('profile.avatar.save')}
            </Button>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-primary">{t('profile.personalInfo.title')}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSavingProfile}
            >
              {isEditing ? t('profile.personalInfo.cancel') : t('profile.personalInfo.edit')}
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('profile.personalInfo.fullName')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing || isSavingProfile}
              />
              <Input
                label={t('profile.personalInfo.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing || isSavingProfile}
                placeholder={t('profile.personalInfo.phonePlaceholder')}
              />
              <Input
                label={t('profile.personalInfo.city')}
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing || isSavingProfile}
                placeholder={t('profile.personalInfo.cityPlaceholder')}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-textSecondary mb-1">{t('profile.personalInfo.bio')}</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSavingProfile}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 transition outline-none disabled:bg-gray-50"
                  placeholder={t('profile.personalInfo.bioPlaceholder')}
                />
              </div>
            </div>
            {isEditing && (
              <div className="mt-4 flex gap-3">
                <Button type="submit" isLoading={isSavingProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? t('profile.personalInfo.saving') : t('profile.personalInfo.saveChanges')}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Identity Verification */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <h2 className="text-lg font-bold text-primary mb-4">{t('profile.verification.title')}</h2>

          <div className="mb-4 flex items-center gap-2">
            <span className="font-medium text-textSecondary">{t('profile.verification.statusLabel')}:</span>
            <span className={`flex items-center gap-1 font-semibold ${statusDisplay.className}`}>
              {statusDisplay.icon} {statusDisplay.label}
            </span>
          </div>

          {status === 'rejected' && rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
              <strong>{t('profile.verification.rejectionReason')}:</strong> {rejectionReason}
            </div>
          )}

          {status === 'verified' && (
            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">
              {t('profile.verification.verifiedMessage')}
            </div>
          )}

          {(status === 'not-submitted' || status === 'rejected') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {t('profile.verification.documentTypeLabel')}
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 transition outline-none"
                  disabled={isUploadingDoc}
                >
                  <option value="nationalId">{t('profile.verification.documentTypes.nationalId')}</option>
                  <option value="passport">{t('profile.verification.documentTypes.passport')}</option>
                  <option value="driverLicense">{t('profile.verification.documentTypes.driverLicense')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {t('profile.verification.uploadLabel')}
                </label>
                <div className="flex items-center gap-3">
                  {/* Hidden file input */}
                  <input
                    ref={docInputRef}
                    id="doc-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocChange}
                    className="hidden"
                    disabled={isUploadingDoc}
                  />
                  {/* Button that triggers the file input */}
                  <Button
                    variant="outline"
                    onClick={() => docInputRef.current?.click()}
                    disabled={isUploadingDoc}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {docFile ? t('profile.verification.changeFile') : t('profile.verification.chooseFile')}
                  </Button>
                  {docFile && (
                    <span className="text-sm text-textSecondary truncate max-w-[200px]">
                      {docFile.name}
                    </span>
                  )}
                  {docFile && (
                    <button
                      type="button"
                      onClick={handleClearDoc}
                      className="text-danger hover:text-danger-dark transition"
                      aria-label="Clear file"
                      disabled={isUploadingDoc}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {docFile && (
                <Button
                  size="sm"
                  onClick={handleDocUpload}
                  isLoading={isUploadingDoc}
                  disabled={isUploadingDoc}
                  className="bg-gold hover:bg-gold-dark text-white"
                >
                  {isUploadingDoc ? t('profile.verification.submitting') : t('profile.verification.submit')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
