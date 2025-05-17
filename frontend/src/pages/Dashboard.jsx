import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchDashboardData } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css'; // Import the CSS file

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: { visits: 0, actions: 0, completions: 0 },
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from your API
        // const data = await fetchDashboardData();
        
        // For demo purposes, we'll use mock data
        const mockData = {
          stats: {
            visits: 1245,
            actions: 826,
            completions: 419
          },
          chartData: [
            { name: 'Jan', value: 400 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 600 },
            { name: 'Apr', value: 800 },
            { name: 'May', value: 500 },
            { name: 'Jun', value: 900 }
          ]
        };
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">Welcome, {currentUser?.name || 'User'}</h1>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card visits">
          <div className="stat-title">Total Visits</div>
          <div className="stat-value">{dashboardData.stats.visits.toLocaleString()}</div>
        </div>
        
        <div className="stat-card actions">
          <div className="stat-title">Total Actions</div>
          <div className="stat-value">{dashboardData.stats.actions.toLocaleString()}</div>
        </div>
        
        <div className="stat-card completions">
          <div className="stat-title">Completions</div>
          <div className="stat-value">{dashboardData.stats.completions.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="chart-container">
        <h2 className="chart-header">Activity Overview</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dashboardData.chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4299e1"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;