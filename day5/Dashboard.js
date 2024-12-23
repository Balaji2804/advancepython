//import React, { useState, useContext } from 'react';
//import { Link } from 'react-router-dom';
//import axios from 'axios';
//import { CacheContext } from './CacheProvider';
//import LoadingIcon from './Loading'; // Import the LoadingIcon component
//import 'bootstrap/dist/css/bootstrap.min.css';
//import 'bootstrap-icons/font/bootstrap-icons.css';
//
//const ResiliencyDashboard = () => {
//  const [currentView, setCurrentView] = useState('platforms');
//  const [currentTeamName, setCurrentTeamName] = useState('');
//  const [loading, setLoading] = useState(false); // Remove loading state
//  const { cache, updateCacheOnRegionChange } = useContext(CacheContext);
//
//  const fetchFailoverConfig = async () => {
//    try {
//      const response = await axios.get('/failover/config');
//      updateCacheOnRegionChange(response.data.applications, response.data.teams, response.data.groups);
//    } catch (error) {
//      console.error('Error fetching failover configuration:', error);
//    }
//  };
//
//  const showTeamsForPlatform = () => {
//    const teams = [...new Set(cache.platforms.map(app => app.TeamName))];
//    return teams.map(team => (
//      <div
//        key={team}
//        className="card m-2 bg-primary text-white shadow-sm"
//        style={{ width: '18rem' }}
//      >
//        <div className="card-body">
//          <h5 className="card-title">{team}</h5>
//          <p className="card-text">View details for the {team} team.</p>
//          <button
//            className="btn btn-outline-light"
//            onClick={() => showTeamDetails(team)}
//          >
//            View Applications
//          </button>
//        </div>
//      </div>
//    ));
//  };
//
//  const showTeamDetails = (teamName) => {
//    setCurrentView('teamApplications');
//    setCurrentTeamName(teamName);
//  };
//
//  const failoverApp = async (appName, direction) => {
//    const confirmed = window.confirm(`Are you sure you want to failover ${appName} to ${direction.toUpperCase()}?`);
//    if (!confirmed) return;
//
//    setLoading(true); // Set loading state
//    try {
//      const response = await axios.post('/failover/app', {
//        app_name: appName,
//        direction
//      });
//      await fetchFailoverConfig(); // Refresh data
//      alert(response.data.message);
////      fetchFailoverConfig(); // Refresh data
//    } catch (error) {
//      alert(`Failed to failover ${appName}: ${error.response?.data?.detail || 'Unknown error'}`);
//    }
//     finally {
//        setLoading(false);
//    }
//  };
//
//  const failoverGroup = async (groupName, direction) => {
//    const confirmed = window.confirm(`Are you sure you want to failover the group ${groupName} to ${direction.toUpperCase()}?`);
//    if (!confirmed) return;
//
//    try {
//      await axios.post('/failover/group', {
//        group_name: groupName,
//        direction
//      });
//      alert(`Group ${groupName} successfully failed over to ${direction.toUpperCase()}!`);
//      fetchFailoverConfig(); // Refresh data
//    } catch (error) {
//      alert(`Failed to failover the group ${groupName}: ${error.response?.data?.detail || 'Unknown error'}`);
//    }
//  };
//
//  const renderApplications = () => {
//    const teamApplications = cache.platforms.filter(
//      app => app.TeamName === currentTeamName
//    );
//
//    return teamApplications.map(app => {
//      const isEastActive = app.CurrentRegion === 'east';
//      return (
//        <div
//          key={app.AppName}
//          className="card m-2 bg-secondary text-white shadow-sm"
//          style={{ width: '18rem' }}
//        >
//          <div className="card-body">
//            <h5 className="card-title">{app.AppName}</h5>
//            <p className="card-text">
//              <span>Active Region: </span>
//              <span className={`badge ${isEastActive ? 'badge-success' : 'badge-primary'}`}>
//                {app.CurrentRegion.charAt(0).toUpperCase() + app.CurrentRegion.slice(1)}
//              </span>
//            </p>
//            <div className="d-flex justify-content-between">
//              <button
//                className={`btn btn-sm ${isEastActive ? 'btn-success active-region' : 'btn-outline-success'}`}
//                onClick={() => failoverApp(app.AppName, 'east')}
//              >
//                East
//              </button>
//              <button
//                className={`btn btn-sm ${isEastActive ? 'btn-outline-primary' : 'btn-primary active-region'}`}
//                onClick={() => failoverApp(app.AppName, 'west')}
//              >
//                West
//              </button>
//            </div>
//          </div>
//        </div>
//      );
//    });
//  };
//
//  const renderGroups = () => {
//    const teamApplications = cache.platforms.filter(
//      app => app.TeamName === currentTeamName
//    );
//    const teamGroups = cache.groups.filter(
//      group => group.Apps.some(app =>
//        teamApplications.map(a => a.AppName).includes(app)
//      )
//    );
//
//    return teamGroups.map(group => (
//      <div
//        key={group.GroupName}
//        className="card m-2 bg-dark text-white shadow-sm"
//        style={{ width: '20rem' }}
//      >
//        <div className="card-body">
//          <h5 className="card-title">{group.GroupName} - Group</h5>
//          <p className="card-text">Applications in this group:</p>
//          <ul className="list-group mb-3">
//            {group.Apps.map(appName => {
//              const matchedApp = teamApplications.find(a => a.AppName === appName);
//              const regionBadgeClass = matchedApp && matchedApp.CurrentRegion === 'east'
//                ? 'badge-success'
//                : 'badge-primary';
//              const regionDisplay = matchedApp
//                ? matchedApp.CurrentRegion.charAt(0).toUpperCase() + matchedApp.CurrentRegion.slice(1)
//                : 'Pending';
//
//              return (
//                <li key={appName} className="list-group-item text-dark">
//                  {appName} <span className={`badge ${regionBadgeClass}`}>
//                    Region: {regionDisplay}
//                  </span>
//                </li>
//              );
//            })}
//          </ul>
//          <div className="d-flex justify-content-between">
//            <button
//              className="btn btn-success btn-sm region-btn"
//              onClick={() => failoverGroup(group.GroupName, 'east')}
//            >
//              East
//            </button>
//            <button
//              className="btn btn-primary btn-sm region-btn"
//              onClick={() => failoverGroup(group.GroupName, 'west')}
//            >
//              West
//            </button>
//          </div>
//        </div>
//      </div>
//    ));
//  };
//
//  return (
//    <div className="container-fluid p-0">
//      <div className="row m-0">
//
//        {/* Main Content Panel */}
//        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 pt-4">
//          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
//            <h1 className="h2">Resiliency Portal - Dashboard</h1>
//          </div>
//
//          {/* Dynamic Content Area */}
//          <div id="contentPanel">
//            {loading ? (
//              <LoadingIcon /> // Display loading icon while loading
//            ) : (
//              <>
//                {/* Platforms Section */}
//                {currentView === 'platforms' && (
//                  <div id="platformsView" className="view-section">
//                    <h3>Platforms</h3>
//                    <div className="card bg-dark text-white mb-3">
//                      <div className="card-body">
//                        <h5 className="card-title">Platform Teams & Groups</h5>
//                        <p className="card-text">Select a team to view its applications and failover status.</p>
//                        <div id="platformList" className="d-flex flex-wrap justify-content-start">
//                          {showTeamsForPlatform()}
//                        </div>
//                      </div>
//                    </div>
//                  </div>
//                )}
//
//
//                {/* Team Applications and Groups Section */}
//                {currentView === 'teamApplications' && (
//                  <div id="teamApplicationsView" className="view-section">
//                    <h3>Team Applications and Groups</h3>
//                    <div id="teamContainer" className="mb-4">
//                      <h4>Applications</h4>
//                      <div id="applicationList" className="d-flex flex-wrap justify-content-start">
//                        {renderApplications()}
//                      </div>
//                    </div>
//                    <div id="groupContainer">
//                      <h4>Groups</h4>
//                      <div id="groupList" className="d-flex flex-wrap justify-content-start">
//                        {renderGroups()}
//                      </div>
//                    </div>
//                    {/* Back to Home Button */}
//      <div className="btn-home mb-3">
//        <Link to="/" className="btn btn-primary btn-sm">
//          <i className="bi bi-house-door-fill me-2"></i>
//          Back to Dashboard
//        </Link>
//      </div>
//                  </div>
//                )}
//              </>
//            )}
//          </div>
//        </main>
//      </div>
//    </div>
//  );
//};
//
//export default ResiliencyDashboard;
//
//

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CacheContext } from './CacheProvider';
import LoadingIcon from './Loading';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ResiliencyDashboard = () => {
  const [currentView, setCurrentView] = useState('platforms');
  const [currentTeamName, setCurrentTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  // Updated context destructuring to include updateApplicationInCache
  const { cache, updateCacheOnRegionChange, updateApplicationInCache } = useContext(CacheContext);

  const fetchFailoverConfig = async () => {
    try {
      const response = await axios.get('/failover/config');
      updateCacheOnRegionChange(response.data.applications, response.data.teams, response.data.groups);
    } catch (error) {
      console.error('Error fetching failover configuration:', error);
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
  };

const failoverApp = async (appName, direction) => {
  const confirmed = window.confirm(`Are you sure you want to failover ${appName} to ${direction.toUpperCase()}?`);
  if (!confirmed) return;

  setLoading(true);
  try {
    const response = await axios.post('/failover/app', {
      app_name: appName,
      direction
    });
    const updatedApp = response.data;
    updateApplicationInCache(updatedApp); // Update the cache for the specific application
    alert(response.data.message);
  } catch (error) {
    alert(`Failed to failover ${appName}: ${error.response?.data?.detail || 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};

  const failoverGroup = async (groupName, direction) => {
    const confirmed = window.confirm(`Are you sure you want to failover the group ${groupName} to ${direction.toUpperCase()}?`);
    if (!confirmed) return;

    try {
      await axios.post('/failover/group', {
        group_name: groupName,
        direction
      });

      // For group failover, we need to update all applications
      const configResponse = await axios.get('/failover/config');
      updateCacheOnRegionChange(
        configResponse.data.applications,
        configResponse.data.teams,
        configResponse.data.groups
      );

      alert(`Group ${groupName} successfully failed over to ${direction.toUpperCase()}!`);
    } catch (error) {
      alert(`Failed to failover the group ${groupName}: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const renderApplications = () => {
    const teamApplications = cache.platforms.filter(
      app => app.TeamName === currentTeamName
    );

    return teamApplications.map(app => {
      const isEastActive = app.CurrentRegion === 'east';
      return (
        <div
          key={app.AppName}
          className="card m-2 bg-secondary text-white shadow-sm"
          style={{ width: '18rem' }}
        >
          <div className="card-body">
            <h5 className="card-title">{app.AppName}</h5>
            <p className="card-text">
              <span>Active Region: </span>
              <span className={`badge ${isEastActive ? 'badge-success' : 'badge-primary'}`}>
                {app.CurrentRegion.charAt(0).toUpperCase() + app.CurrentRegion.slice(1)}
              </span>
            </p>
            <div className="d-flex justify-content-between">
              <button
                className={`btn btn-sm ${isEastActive ? 'btn-success active-region' : 'btn-outline-success'}`}
                onClick={() => failoverApp(app.AppName, 'east')}
              >
                East
              </button>
              <button
                className={`btn btn-sm ${isEastActive ? 'btn-outline-primary' : 'btn-primary active-region'}`}
                onClick={() => failoverApp(app.AppName, 'west')}
              >
                West
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderGroups = () => {
    const teamApplications = cache.platforms.filter(
      app => app.TeamName === currentTeamName
    );
    const teamGroups = cache.groups.filter(
      group => group.Apps.some(app =>
        teamApplications.map(a => a.AppName).includes(app)
      )
    );

    return teamGroups.map(group => (
      <div
        key={group.GroupName}
        className="card m-2 bg-dark text-white shadow-sm"
        style={{ width: '20rem' }}
      >
        <div className="card-body">
          <h5 className="card-title">{group.GroupName} - Group</h5>
          <p className="card-text">Applications in this group:</p>
          <ul className="list-group mb-3">
            {group.Apps.map(appName => {
              const matchedApp = teamApplications.find(a => a.AppName === appName);
              const regionBadgeClass = matchedApp && matchedApp.CurrentRegion === 'east'
                ? 'badge-success'
                : 'badge-primary';
              const regionDisplay = matchedApp
                ? matchedApp.CurrentRegion.charAt(0).toUpperCase() + matchedApp.CurrentRegion.slice(1)
                : 'Pending';

              return (
                <li key={appName} className="list-group-item text-dark">
                  {appName} <span className={`badge ${regionBadgeClass}`}>
                    Region: {regionDisplay}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-success btn-sm region-btn"
              onClick={() => failoverGroup(group.GroupName, 'east')}
            >
              East
            </button>
            <button
              className="btn btn-primary btn-sm region-btn"
              onClick={() => failoverGroup(group.GroupName, 'west')}
            >
              West
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container-fluid p-0">
      <div className="row m-0">
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 pt-4">
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
                    <h3>Platforms</h3>
                    <div className="card bg-dark text-white mb-3">
                      <div className="card-body">
                        <h5 className="card-title">Platform Teams & Groups</h5>
                        <p className="card-text">Select a team to view its applications and failover status.</p>
                        <div id="platformList" className="d-flex flex-wrap justify-content-start">
                          {showTeamsForPlatform()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 'teamApplications' && (
                  <div id="teamApplicationsView" className="view-section">
                    <h3>Team Applications and Groups</h3>
                    <div id="teamContainer" className="mb-4">
                      <h4>Applications</h4>
                      <div id="applicationList" className="d-flex flex-wrap justify-content-start">
                        {renderApplications()}
                      </div>
                    </div>
                    <div id="groupContainer">
                      <h4>Groups</h4>
                      <div id="groupList" className="d-flex flex-wrap justify-content-start">
                        {renderGroups()}
                      </div>
                    </div>
                    <div className="btn-home mb-3">
                      <Link to="/" className="btn btn-primary btn-sm">
                        <i className="bi bi-house-door-fill me-2"></i>
                        Back to Dashboard
                      </Link>
                    </div>
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
