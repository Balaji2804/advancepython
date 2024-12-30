import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await axios.get('/failover/logs');
      setLogs(response.data);
    };

    fetchLogs();
  }, []);

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <h2>Track Logs</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <p>Date: {new Date(log.timestamp).toLocaleString()}</p>
            <p>User: {log.user}</p>
            <p>Direction: {log.direction}</p>
            <p>Results: {JSON.stringify(log.results)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrackLogs;
