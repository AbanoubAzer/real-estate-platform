import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../../shared/hooks/useSession';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const { sessionId } = useSession();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:3333/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sessionId }) // Pass sessionId for data migration!
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success! Log the user in
      setAuth(data.user, data.access_token);
      navigate('/dashboard'); // or wherever appropriate
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">إنشاء حساب جديد</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">الاسم الأول</label>
            <input type="text" name="firstName" required onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">الاسم الأخير</label>
            <input type="text" name="lastName" required onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input type="email" name="email" required onChange={handleChange} className="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">رقم الهاتف (اختياري)</label>
          <input type="tel" name="phone" onChange={handleChange} className="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input type="password" name="password" required minLength={6} onChange={handleChange} className="w-full border rounded-lg p-2" />
        </div>

        <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors mt-4">
          تسجيل حساب
        </button>
      </form>
    </div>
  );
};
