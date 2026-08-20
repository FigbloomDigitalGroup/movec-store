import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiSave } from 'react-icons/fi';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import type { Address } from '../types';
import { getPasswordError, PASSWORD_REQUIREMENTS_HINT } from '../lib/passwordPolicy';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password'>('profile');
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState<string | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '' });

  // Password form
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Address form
  const [addressForm, setAddressForm] = useState({ type: 'SHIPPING', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Kenya', isDefault: false });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then(r => r.data),
  });

  // Keep the edit form in sync with whatever the server actually has on file —
  // otherwise saving just the name (without touching phone) would PATCH phone
  // back to an empty string. Adjusting state during render (rather than in an
  // effect) re-syncs the instant a fresh `profile` reference shows up, without
  // an extra render pass.
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setProfileForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
    });
  }

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/me/addresses').then(r => r.data),
  });

  const updateProfile = useMutation({
    mutationFn: (data: typeof profileForm) => api.patch('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const changePassword = useMutation({
    mutationFn: () => api.post('/auth/change-password', { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }),
    onSuccess: () => {
      toast.success('Password changed!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const saveAddress = useMutation({
    mutationFn: (data: typeof addressForm) => {
      if (editingAddress) return api.patch(`/users/me/addresses/${editingAddress}`, data);
      return api.post('/users/me/addresses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddAddress(false);
      setEditingAddress(null);
      setAddressForm({ type: 'SHIPPING', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Kenya', isDefault: false });
      toast.success(editingAddress ? 'Address updated' : 'Address added');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteAddress = useMutation({
    mutationFn: (id: string) => api.delete(`/users/me/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
      setPendingDeleteAddressId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const startEditAddress = (addr: Address) => {
    setEditingAddress(addr.id);
    setAddressForm({ type: addr.type, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state || '', postalCode: addr.postalCode, country: addr.country, isDefault: addr.isDefault });
    setShowAddAddress(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-section-title mb-2 text-gray-900">My Account</h1>
      <p className="text-gray-600 mb-8">Manage your profile, addresses, and password</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8" role="tablist" aria-label="Account sections">
        {(
          [
            { key: 'profile', label: 'Profile', icon: FiUser },
            { key: 'addresses', label: 'Addresses', icon: FiMapPin },
            { key: 'password', label: 'Password', icon: FiEdit2 },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`account-tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            aria-controls={`account-panel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div role="tabpanel" id="account-panel-profile" aria-labelledby="account-tab-profile" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          {profileLoading ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary-500">
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
                  <p className="text-gray-500">{profile?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-firstName" className="block text-sm font-medium mb-1">First Name</label>
                  <input id="profile-firstName" value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
                </div>
                <div>
                  <label htmlFor="profile-lastName" className="block text-sm font-medium mb-1">Last Name</label>
                  <input id="profile-lastName" value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="block text-sm font-medium mb-1">Phone</label>
                  <input id="profile-phone" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium mb-1">Email</label>
                  <input id="profile-email" value={profile?.email || ''} disabled className="border rounded-lg px-4 py-2 w-full bg-gray-100" />
                </div>
              </div>
              <button
                onClick={() => updateProfile.mutate(profileForm)}
                disabled={updateProfile.isPending}
                className="mt-6 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={16} /> {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div role="tabpanel" id="account-panel-addresses" aria-labelledby="account-tab-addresses">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-section-title text-gray-900">Saved Addresses</h2>
            <button onClick={() => { setEditingAddress(null); setAddressForm({ type: 'SHIPPING', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Kenya', isDefault: false }); setShowAddAddress(true); }} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FiPlus size={16} /> Add Address
            </button>
          </div>

          {showAddAddress && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-4">
              <h3 className="font-semibold mb-4">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={addressForm.type} onChange={e => setAddressForm({ ...addressForm, type: e.target.value })} className="border rounded-lg px-4 py-2">
                  <option value="SHIPPING">Shipping</option>
                  <option value="BILLING">Billing</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4" />
                  Set as default
                </label>
                <Input label="Address Line 1" value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} required />
                <Input label="Address Line 2" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} />
                <Input label="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                <Input label="State" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                <Input label="Postal Code" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} required />
                <Input label="Country" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => saveAddress.mutate(addressForm)}
                  disabled={!addressForm.line1 || !addressForm.city || !addressForm.postalCode || saveAddress.isPending}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck size={16} /> {saveAddress.isPending ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setShowAddAddress(false); setEditingAddress(null); }} className="border px-4 py-2 rounded-lg flex items-center gap-2"><FiX size={16} /> Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {addressesLoading ? (
              [1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : (
              <>
                {addresses?.map((addr: Address) => (
                  <div key={addr.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{addr.type}</span>
                        {addr.isDefault && <span className="bg-primary-50 text-primary-500 text-xs px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-gray-500 text-sm">{addr.city}{addr.state ? `, ${addr.state}` : ''} · {addr.postalCode} · {addr.country}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditAddress(addr)} aria-label="Edit address" className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg"><FiEdit2 size={16} /></button>
                      <button onClick={() => setPendingDeleteAddressId(addr.id)} aria-label="Delete address" className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {!addresses?.length && <p className="text-gray-500 text-center py-8 bg-white/80 backdrop-blur-sm rounded-xl">No addresses saved yet.</p>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div role="tabpanel" id="account-panel-password" aria-labelledby="account-tab-password" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-oldPassword" className="block text-sm font-medium mb-1">Current Password</label>
              <input id="profile-oldPassword" type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <div>
              <label htmlFor="profile-newPassword" className="block text-sm font-medium mb-1">New Password</label>
              <input id="profile-newPassword" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
              <p className="text-xs text-gray-500 mt-1">{PASSWORD_REQUIREMENTS_HINT}</p>
            </div>
            <div>
              <label htmlFor="profile-confirmPassword" className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input id="profile-confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <button
              onClick={() => {
                const passwordError = getPasswordError(passwordForm.newPassword);
                if (passwordError) return toast.error(passwordError);
                if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
                changePassword.mutate();
              }}
              disabled={changePassword.isPending}
              className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePassword.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteAddressId}
        title="Delete this address?"
        description="This can't be undone."
        confirmLabel="Delete"
        isPending={deleteAddress.isPending}
        onConfirm={() => pendingDeleteAddressId && deleteAddress.mutate(pendingDeleteAddressId)}
        onCancel={() => setPendingDeleteAddressId(null)}
      />
    </div>
  );
}
