import React, { useState, useEffect, useContext, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import axios from 'axios';
import { CacheContext } from './CacheProvider';

const ExecutionCount = () => {
  const [failoverData, setFailoverData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeZone, setTimeZone] = useState('IST'); // Default time zone to IST
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

  const getTeamForApp = (appName) => {
    if (!cache.platforms) return 'Unknown';
    const app = cache.platforms.find(platform =>
      platform.AppName === appName || appName.startsWith(platform.AppName)
    );
    return app ? app.TeamName : 'Unknown';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return timeZone === 'IST'
      ? date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const processFailoverData = (logs) => {
    const teamStats = {};

    if (cache.platforms) {
      const uniqueTeams = [...new Set(cache.platforms.map(app => app.TeamName))];
      uniqueTeams.forEach(team => {
        teamStats[team] = {
          team,
          succeeded: 0,
          failed: 0,
          skipped: 0,
          total: 0,
          recentOperations: [],
          lastUpdated: null
        };
      });
    }

    logs.slice().reverse().forEach(log => {
      const timestamp = formatTimestamp(log.timestamp || new Date());
      log.results.succeeded?.forEach(appName => {
        const team = getTeamForApp(appName);
        if (teamStats[team]) {
          teamStats[team].succeeded++;
          teamStats[team].total++;
          teamStats[team].recentOperations.push({
            app: appName,
            status: 'succeeded',
            timestamp,
            direction: log.direction
          });
        }
      });

      log.results.failed?.forEach(failure => {
        const appName = typeof failure === 'string' ? failure : failure.app;
        const team = getTeamForApp(appName);
        if (teamStats[team]) {
          teamStats[team].failed++;
          teamStats[team].total++;
          teamStats[team].recentOperations.push({
            app: appName,
            status: 'failed',
            timestamp,
            direction: log.direction,
            reason: typeof failure === 'object' ? failure.reason : null
          });
        }
      });

      log.results.skipped?.forEach(skipped => {
        const appName = typeof skipped === 'string' ? skipped : skipped.app;
        const team = getTeamForApp(appName);
        if (teamStats[team]) {
          teamStats[team].skipped++;
          teamStats[team].total++;
          teamStats[team].recentOperations.push({
            app: appName,
            status: 'skipped',
            timestamp,
            direction: log.direction,
            reason: typeof skipped === 'object' ? skipped.reason : null
          });
        }
      });
    });

    return Object.values(teamStats)
      .map(stat => ({
        ...stat,
        recentOperations: stat.recentOperations.slice(0, 5)
      }))
      .sort((a, b) => b.total - a.total);
  };

  const handleTimeZoneChange = (event) => {
    setTimeZone(event.target.value);
  };

  const CustomLabel = ({ x, y, width, value }) => {
    return (
      <text
        x={x + width / 2}
        y={y}
        fill="#000"
        textAnchor="middle"
        dy={-6}
      >
        {value}
      </text>
    );
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
    <div className="card shadow-sm m-3" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title mb-0">Failover Operations by Team</h2>
          <div>
            <label htmlFor="timeZone" className="me-2">Time Zone:</label>
            <select id="timeZone" value={timeZone} onChange={handleTimeZoneChange} className="form-select form-select-sm">
              <option value="IST">IST</option>
              <option value="EST">EST</option>
            </select>
          </div>
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
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="succeeded" name="Succeeded" fill="#28a745" stackId="a">
                <LabelList content={<CustomLabel />} />
              </Bar>
              <Bar dataKey="failed" name="Failed" fill="#dc3545" stackId="a">
                <LabelList content={<CustomLabel />} />
              </Bar>
              <Bar dataKey="skipped" name="Skipped" fill="#ffc107" stackId="a">
                <LabelList content={<CustomLabel />} />
              </Bar>
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
                      Total Operations
                      <span className="badge bg-primary rounded-pill">{team.total}</span>
                    </div>
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
                  {team.recentOperations.length > 0 && (
                    <div className="mt-3">
                      <small className="text-muted">Latest operation: {team.recentOperations[0].timestamp}</small>
                    </div>
                  )}
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
