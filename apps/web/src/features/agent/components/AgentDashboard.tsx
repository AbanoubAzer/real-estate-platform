import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Home, Eye, Users, FileText } from 'lucide-react';

import { LeadPriorityQueue } from '../../leads/components/LeadPriorityQueue';
import { ConversionFunnelWidget } from '../../leads/components/ConversionFunnelWidget';

export const AgentDashboard = () => {
  const { token, user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['agentStats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/agent/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled: !!token
  });

  if (isLoading) return <div className="p-12 text-center">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-6 py-12 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">لوحة تحكم الوكيل</h1>
          <p className="text-gray-500 mt-2">مرحباً بك، {user?.firstName} {user?.lastName}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/agent/leads" className="bg-white border border-primary text-primary px-5 py-3 rounded-lg font-bold hover:bg-primary/5 flex items-center gap-2">
            <Users size={18} /> خط سير العملاء (Kanban)
          </Link>
          <Link to="/agent/properties/new" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center gap-2">
            + إضافة عقار جديد
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Home /></div>
          <div>
            <p className="text-sm text-gray-500">إجمالي العقارات</p>
            <p className="text-2xl font-bold font-en">{stats?.properties?.total || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Eye /></div>
          <div>
            <p className="text-sm text-gray-500">عقارات منشورة</p>
            <p className="text-2xl font-bold font-en">{stats?.properties?.published || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><FileText /></div>
          <div>
            <p className="text-sm text-gray-500">قيد المراجعة</p>
            <p className="text-2xl font-bold font-en">{stats?.properties?.pendingReview || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><Users /></div>
          <div>
            <p className="text-sm text-gray-500">إجمالي العملاء المهتمين</p>
            <p className="text-2xl font-bold font-en">{stats?.leadsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* E11.21: Agent Priority Queue */}
      <LeadPriorityQueue />

      {/* E11.19: Conversion Funnel Widget */}
      <ConversionFunnelWidget />
    </div>
  );
};
