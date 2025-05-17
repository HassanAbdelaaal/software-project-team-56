import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchAdminStats } from '../../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    usersByRole: []
  });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        setLoading(true);
        // In a real app, this would come from your API:
        // const data = await fetchAdminStats();
        
        // Mock data for demonstration
        const mockData = {
          totalUsers: 1245,
          activeUsers: 872,
          pendingApprovals: 21,
          usersByRole: [
            { name: 'Admin', value: 12 },
            { name: 'Manager', value: 58 },
            { name: 'Editor', value: 124 },
            { name: 'User', value: 1051 }
          ]
        };
        
        setStats(mockData);
      } catch (error) {
        console.error('Error loading admin stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, []);

  if (loading) {
    return <div className="text-center p-6">Loading admin data...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 mb-2">Active Users</h3>
          <p className="text-3xl font-bold">{stats.activeUsers}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
          {stats.pendingApprovals > 0 && (
            <button className="mt-2 text-blue-500 text-sm">
              Review Requests
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3 text-sm">
              <span className="text-green-500">●</span>
              <span>New user registered: <b>John Smith</b></span>
              <span className="text-gray-400 ml-auto">2 min ago</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
              <span className="text-yellow-500">●</span>
              <span>Role change: <b>Susan Lee</b> from User to Editor</span>
              <span className="text-gray-400 ml-auto">45 min ago</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
              <span className="text-red-500">●</span>
              <span>Account locked: <b>Michael Brown</b> (Failed attempts)</span>
              <span className="text-gray-400 ml-auto">2 hours ago</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
              <span className="text-blue-500">●</span>
              <span>Password reset requested: <b>Karen Wilson</b></span>
              <span className="text-gray-400 ml-auto">5 hours ago</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
              <span className="text-green-500">●</span>
              <span>New admin approved: <b>David Johnson</b></span>
              <span className="text-gray-400 ml-auto">1 day ago</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;