import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchFailoverData } from './api'; // Import API function

const ExecutionCount = () => {
  const [failoverData, setFailoverData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFailoverData = async () => {
    try {
      const logs = await fetchFailoverData();
      const processedData = processFailoverData(logs); // Assuming processFailoverData is defined elsewhere
      setFailoverData(processedData);
    } catch (error) {
      console.error('Error loading failover data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFailoverData();

    const handleFailoverComplete = () => {
      loadFailoverData(); // Reload data when failover completes
    };

    window.addEventListener('failoverComplete', handleFailoverComplete);
    return () => {
      window.removeEventListener('failoverComplete', handleFailoverComplete);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={failoverData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="team" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="succeeded" fill="#82ca9d" />
          <Bar dataKey="failed" fill="#f56c6c" />
          <Bar dataKey="skipped" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExecutionCount;
