import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CacheContext } from './CacheProvider';
import { fetchData } from './ExecutionCount'; // Import the fetchData function
import LoadingIcon from './Loading';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ResiliencyDashboard = () => {
  const [currentView, setCurrentView] = useState('platforms');
  const [currentTeamName, setCurrentTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [failoverData, setFailoverData] = useState([]);
  const [error, setError] = useState(null);
  const { cache, updateCacheOnRegionChange } = useContext(CacheContext);

  const fetchFailoverConfig = async () => {
    try {
      const response = await axios.get('/failover/config');
      updateCacheOnRegionChange(response.data.applications, response.data.teams);
    } catch (error) {
      console.error('Error fetching failover configuration:', error);
    }
  };
const handleFailoverComplete = () => {
  fetchData();
};
  // Add an event listener for the custom event
useEffect(() => {
  window.addEventListener('failoverComplete', handleFailoverComplete);

  return () => {
    window.removeEventListener('failoverComplete', handleFailoverComplete);
  };
}, []);

  const handleSelectApp = (appName) => {
    setSelectedApps((prevSelectedApps) =>
      prevSelectedApps.includes(appName)
        ? prevSelectedApps.filter((app) => app !== appName)
        : [...prevSelectedApps, appName]
    );
  };

  const handleCheckAll = () => {
    const teamApps = cache.platforms.filter(app => app.TeamName === currentTeamName);
    if (selectedApps.length === teamApps.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(teamApps.map(app => app.AppName));
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('/failover/logs');
      const logs = response.data;

      if (!logs || !Array.isArray(logs)) {
        throw new Error('Invalid logs data format');
      }

      const processedData = processFailoverData(logs);
      setFailoverData(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

    const getTeamForApp = (appName) => {
    if (!cache.platforms) return null;

    const app = cache.platforms.find(platform =>
      platform.AppName === appName || appName.startsWith(platform.AppName)
    );
    return app ? app.TeamName : null;
  };

    const processFailoverData = (logs) => {
    const teamCounts = {};

    // Initialize team counts
    if (cache.platforms) {
      const uniqueTeams = [...new Set(cache.platforms.map(app => app.TeamName))];
      uniqueTeams.forEach(team => {
        teamCounts[team] = {
          succeeded: 0,
          failed: 0,
          skipped: 0,
          total: 0
        };
      });
    }

    // Process each log entry
    logs.forEach(log => {
      // Process succeeded apps
      if (log.succeeded) {
        log.succeeded.forEach(appName => {
          const team = getTeamForApp(appName);
          if (team && teamCounts[team]) {
            teamCounts[team].succeeded += 1;
            teamCounts[team].total += 1;
          }
        });
      }

      // Process failed apps
      if (log.failed) {
        log.failed.forEach(app => {
          const appName = typeof app === 'string' ? app : app.app;
          const team = getTeamForApp(appName);
          if (team && teamCounts[team]) {
            teamCounts[team].failed += 1;
            teamCounts[team].total += 1;
          }
        });
      }

      // Process skipped apps
      if (log.skipped) {
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

    // Convert to array format for Recharts
    return Object.entries(teamCounts).map(([team, counts]) => ({
      team,
      ...counts
    }));
  };

  const failoverSelectedApps = async (direction) => {
    if (selectedApps.length === 0) {
      alert('Please select at least one application');
      return;
    }

    const appsToFailover = selectedApps;
    const confirmed = window.confirm(
      `Are you sure you want to failover the following application(s) to ${direction.toUpperCase()}?\n` +
      appsToFailover.join('\n')
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/failover/failoveroperation', {
        selected_apps: appsToFailover,
        direction
      });

      const { results } = response.data;

       // Create a custom event with the failover results
      const failoverCompleteEvent = new CustomEvent('failoverComplete', {
        detail: {
          results,
          timestamp: new Date().toISOString()
        }
      });



      // Dispatch the event
      window.dispatchEvent(failoverCompleteEvent);

      alert(
        `Failover completed:\n` +
        `Succeeded: ${results.succeeded.length} (${results.succeeded.join(', ')})\n` +
        `Failed: ${results.failed.length} (${results.failed.map(f => f.app).join(', ')})\n` +
        `Skipped: ${results.skipped.length} (${results.skipped.map(s => s.app).join(', ')})`
      );

      await fetchFailoverConfig();
      setSelectedApps([]);

          // Trigger re-fetch of logs for ExecutionCount
    fetchData();
//        const event = new Event('failoverComplete');
//        window.dispatchEvent(event);

    } catch (error) {
      alert(`Failed to failover selected applications: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showTeamsForPlatform = () => {
    const teams = [...new Set(cache.platforms.map(app => app.TeamName))];
    return teams.map(team => (
      <div
        key={team}
        className="card m-2 bg-primary text-white shadow-sm"
        style={{ width: '18rem' }}
      >
        <div className="card-body">
          <h5 className="card-title">{team}</h5>
          <p className="card-text">View details for the {team} team.</p>
          <button
            className="btn btn-outline-light"
            onClick={() => showTeamDetails(team)}
          >
            View Applications
          </button>
        </div>
      </div>
    ));
  };

  const showTeamDetails = (teamName) => {
    setCurrentView('teamApplications');
    setCurrentTeamName(teamName);
    setSelectedApps([]); // Reset selections when changing teams
  };

  const renderApplications = () => {
    const teamApplications = cache.platforms.filter(
      (app) => app.TeamName === currentTeamName
    );

    return (
      <div>
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedApps.length === teamApplications.length}
              onChange={handleCheckAll}
              id="checkAll"
            />
            <label className="form-check-label" htmlFor="checkAll">
              Select All Applications
            </label>
          </div>
        </div>
        <div className="d-flex flex-wrap">
          {teamApplications.map((app) => {
            const isEastActive = app.CurrentRegion === 'east';
            const isSelected = selectedApps.includes(app.AppName);
            return (
              <div
                key={app.AppName}
                className={`card m-2 ${isSelected ? 'border-primary' : ''}`}
                style={{ width: '18rem' }}
              >
                <div className="card-body">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectApp(app.AppName)}
                      id={`check-${app.AppName}`}
                    />
                    <label className="form-check-label" htmlFor={`check-${app.AppName}`}>
                      {app.AppName}
                    </label>
                  </div>
                  <p className="card-text">
                    <span>Active Region: </span>
                    <span className={`badge ${isEastActive ? 'bg-success' : 'bg-primary'}`}>
                      {app.CurrentRegion.toUpperCase()}
                    </span>
                  </p>
                  {isSelected && (
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => failoverSelectedApps('east')}
                      >
                        Failover to East
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => failoverSelectedApps('west')}
                      >
                        Failover to West
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid p-0">
      <div className="row m-0">
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 pt-4" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
            <h1 className="h2">Resiliency Portal - Dashboard</h1>
          </div>
          <div id="contentPanel">
            {loading ? (
              <LoadingIcon />
            ) : (
              <>
                {currentView === 'platforms' && (
                  <div id="platformsView" className="view-section">
                    <h3>Platform Teams</h3>
                    <div className="d-flex flex-wrap">
                      {showTeamsForPlatform()}
                    </div>
                  </div>
                )}
                {currentView === 'teamApplications' && (
                  <div id="teamApplicationsView" className="view-section">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3>{currentTeamName} Applications</h3>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentView('platforms')}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Teams
                      </button>
                    </div>
                    {renderApplications()}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResiliencyDashboard;
