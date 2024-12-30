import React, { useState, useEffect, useContext, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { CacheContext } from './CacheProvider';

const ExecutionCount = () => {
  const [failoverData, setFailoverData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cache } = useContext(CacheContext);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/failover/logs');
      const logs = response.data;

      if (!logs || !Array.isArray(logs)) {
        throw new Error('Invalid logs data format');
      }

      const processedData = processFailoverData(logs);
      setFailoverData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cache.platforms]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [fetchData]);

  useEffect(() => {
    if (cache.platforms) {
      fetchData();
    }
  }, [cache.platforms]);

  useEffect(() => {
    const handleFailoverComplete = (event) => {
      console.log('Failover complete event received:', event.detail);
      fetchData();
    };

    window.addEventListener('failoverComplete', handleFailoverComplete);
    return () => window.removeEventListener('failoverComplete', handleFailoverComplete);
  }, [fetchData]);

  const getTeamForApp = (appName) => {
    if (!cache.platforms) return null;

    const app = cache.platforms.find(platform =>
      platform.AppName === appName || appName.startsWith(platform.AppName)
    );
    return app ? app.TeamName : null;
  };

  const processFailoverData = (logs) => {
    const teamCounts = {};

    if (cache.platforms) {
      const uniqueTeams = [...new Set(cache.platforms.map(app => app.TeamName))];
      uniqueTeams.forEach(team => {
        teamCounts[team] = {
          succeeded: 0,
          failed: 0,
          skipped: 0,
          total: 0,
          lastUpdated: new Date().toLocaleString()
        };
      });
    }

    logs.forEach(log => {
      if (Array.isArray(log.succeeded)) {
        log.succeeded.forEach(appName => {
          const team = getTeamForApp(appName);
          if (team && teamCounts[team]) {
            teamCounts[team].succeeded += 1;
            teamCounts[team].total += 1;
          }
        });
      }

      if (Array.isArray(log.failed)) {
        log.failed.forEach(failure => {
          const appName = typeof failure === 'string' ? failure : failure.app;
          const team = getTeamForApp(appName);
          if (team && teamCounts[team]) {
            teamCounts[team].failed += 1;
            teamCounts[team].total += 1;
          }
        });
      }

      if (Array.isArray(log.skipped)) {
        log.skipped.forEach(skipped => {
          const appName = typeof skipped === 'string' ? skipped : skipped.app;
          const team = getTeamForApp(appName);
          if (team && teamCounts[team]) {
            teamCounts[team].skipped += 1;
            teamCounts[team].total += 1;
          }
        });
      }
    });

    return Object.entries(teamCounts).map(([team, counts]) => ({
      team,
      ...counts
    }));
  };

  if (loading && failoverData.length === 0) {
    return <div className="d-flex justify-content-center p-5">Loading...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        Error: {error}
        <button className="btn btn-outline-danger ms-3" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card shadow-sm m-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title mb-0">Failover Operations by Team</h2>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failoverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis label={{ value: 'Number of Operations', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="succeeded" name="Succeeded" fill="#28a745" stackId="a" />
              <Bar dataKey="failed" name="Failed" fill="#dc3545" stackId="a" />
              <Bar dataKey="skipped" name="Skipped" fill="#ffc107" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="row mt-4">
          {failoverData.map(team => (
            <div key={team.team} className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{team.team}</h5>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      Succeeded
                      <span className="badge bg-success rounded-pill">{team.succeeded}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      Failed
                      <span className="badge bg-danger rounded-pill">{team.failed}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      Skipped
                      <span className="badge bg-warning rounded-pill">{team.skipped}</span>
                    </div>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    Last updated: {team.lastUpdated}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default ExecutionCount;
