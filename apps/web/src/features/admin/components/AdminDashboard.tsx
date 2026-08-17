import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { ShieldCheck, Users, Home, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [actionError, setActionError] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled: !!token && user?.role === 'ADMIN'
  });

  const { data: pendingProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['adminPendingProperties'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/admin/properties/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
    enabled: !!token && activeTab === 'properties' && user?.role === 'ADMIN'
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, action, notes }: any) => {
      const res = await fetch(`http://localhost:3333/admin/properties/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes, reason: 'Admin Review' })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message);
    }
  });

  if (user?.role !== 'ADMIN') {
    return <div className="p-12 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            لوحة تحكم الإدارة
          </h1>
          <p className="text-gray-500 mt-2">مرحباً، {user?.firstName}</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button onClick={() => setActiveTab('dashboard')} className={`pb-4 px-4 font-bold ${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>نظرة عامة</button>
        <button onClick={() => setActiveTab('properties')} className={`pb-4 px-4 font-bold ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>مراجعة العقارات {stats?.pendingProperties > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">{stats.pendingProperties}</span>}</button>
        <button onClick={() => setActiveTab('agents')} className={`pb-4 px-4 font-bold ${activeTab === 'agents' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>الوكلاء {stats?.pendingAgents > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">{stats.pendingAgents}</span>}</button>
        <button onClick={() => setActiveTab('reports')} className={`pb-4 px-4 font-bold ${activeTab === 'reports' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>البلاغات</button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Users /></div>
            <div>
              <p className="text-sm text-gray-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold font-en">{stats?.users || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><ShieldCheck /></div>
            <div>
              <p className="text-sm text-gray-500">إجمالي الوكلاء</p>
              <p className="text-2xl font-bold font-en">{stats?.agents || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Home /></div>
            <div>
              <p className="text-sm text-gray-500">إجمالي العقارات</p>
              <p className="text-2xl font-bold font-en">{stats?.properties || 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {actionError && <div className="p-4 bg-red-50 text-red-500 text-sm border-b">{actionError}</div>}
          
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4">العقار</th>
                <th className="p-4">الوكيل</th>
                <th className="p-4">تاريخ التقديم</th>
                <th className="p-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {propertiesLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
              ) : pendingProperties?.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا يوجد عقارات معلقة للمراجعة</td></tr>
              ) : (
                pendingProperties?.map((prop: any) => (
                  <tr key={prop.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{prop.title}</td>
                    <td className="p-4">{prop.owner?.firstName} {prop.owner?.lastName}</td>
                    <td className="p-4 text-sm text-gray-500 font-en">{new Date(prop.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4 flex gap-2">
                      <button 
                        onClick={() => verifyMutation.mutate({ id: prop.id, action: 'APPROVE', notes: 'Looks good' })}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-green-200"
                      >
                        <CheckCircle size={16} /> قبول
                      </button>
                      <button 
                        onClick={() => {
                          const note = prompt('سبب الرفض:');
                          if (note) verifyMutation.mutate({ id: prop.id, action: 'REJECT', notes: note });
                        }}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-red-200"
                      >
                        <XCircle size={16} /> رفض
                      </button>
                      <button 
                        onClick={() => {
                          const note = prompt('التعديلات المطلوبة:');
                          if (note) verifyMutation.mutate({ id: prop.id, action: 'CHANGES_REQUESTED', notes: note });
                        }}
                        className="bg-orange-100 text-orange-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-orange-200"
                      >
                        <AlertTriangle size={16} /> تعديل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {(activeTab === 'agents' || activeTab === 'reports') && (
        <div className="bg-white p-12 text-center text-gray-500 border rounded-xl">
          سيتم إضافة هذه الواجهة قريباً...
        </div>
      )}
    </div>
  );
};
