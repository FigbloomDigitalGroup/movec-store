import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password'>('profile');
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '' });

  // Password form
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Address form
  const [addressForm, setAddressForm] = useState({ type: 'SHIPPING', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Kenya', isDefault: false });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then(r => r.data),
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/me/addresses').then(r => r.data),
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Profile updated!');
    },
  });

  const changePassword = useMutation({
    mutationFn: () => api.post('/auth/change-password', { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }),
    onSuccess: () => {
      alert('Password changed!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: any) => alert(err.response?.data?.error?.message || 'Failed'),
  });

  const saveAddress = useMutation({
    mutationFn: (data: any) => {
      if (editingAddress) return api.patch(`/users/me/addresses/${editingAddress}`, data);
      return api.post('/users/me/addresses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddAddress(false);
      setEditingAddress(null);
      setAddressForm({ type: 'SHIPPING', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Kenya', isDefault: false });
    },
  });

  const deleteAddress = useMutation({
    mutationFn: (id: string) => api.delete(`/users/me/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const startEditAddress = (addr: any) => {
    setEditingAddress(addr.id);
    setAddressForm({ type: addr.type, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state || '', postalCode: addr.postalCode, country: addr.country, isDefault: addr.isDefault });
    setShowAddAddress(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-white">My Account</h1>
      <p className="text-gray-300 mb-8">Manage your profile, addresses, and password</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'profile', label: 'Profile', icon: FiUser },
          { key: 'addresses', label: 'Addresses', icon: FiMapPin },
          { key: 'password', label: 'Password', icon: FiEdit2 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={profile?.email || ''} disabled className="border rounded-lg px-4 py-2 w-full bg-gray-100" />
            </div>
          </div>
          <button onClick={() => updateProfile.mutate(profileForm)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <FiSave size={16} /> Save Changes
          </button>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Saved Addresses</h2>
            <button onClick={() => { setEditingAddress(null); setAddressForm({ type: 'SHIPPING', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Kenya', isDefault: false }); setShowAddAddress(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                <input placeholder="Address Line 1" value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="border rounded-lg px-4 py-2" />
                <input placeholder="Address Line 2" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className="border rounded-lg px-4 py-2" />
                <input placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="border rounded-lg px-4 py-2" />
                <input placeholder="State" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="border rounded-lg px-4 py-2" />
                <input placeholder="Postal Code" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="border rounded-lg px-4 py-2" />
                <input placeholder="Country" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className="border rounded-lg px-4 py-2" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => saveAddress.mutate(addressForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FiCheck size={16} /> Save</button>
                <button onClick={() => { setShowAddAddress(false); setEditingAddress(null); }} className="border px-4 py-2 rounded-lg flex items-center gap-2"><FiX size={16} /> Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {addresses?.map((addr: any) => (
              <div key={addr.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{addr.type}</span>
                    {addr.isDefault && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-gray-500 text-sm">{addr.city}{addr.state ? `, ${addr.state}` : ''} · {addr.postalCode} · {addr.country}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditAddress(addr)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                  <button onClick={() => deleteAddress.mutate(addr.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))}
            {!addresses?.length && <p className="text-gray-400 text-center py-8 bg-white/80 backdrop-blur-sm rounded-xl">No addresses saved yet.</p>}
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
            </div>
            <button
              onClick={() => {
                if (passwordForm.newPassword !== passwordForm.confirmPassword) return alert('Passwords do not match');
                if (passwordForm.newPassword.length < 8) return alert('Password must be at least 8 characters');
                changePassword.mutate();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
