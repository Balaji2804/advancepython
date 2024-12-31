import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { CacheContext } from './CacheProvider';
import { fetchFailoverConfig } from './api'; // Import API function
import LoadingIcon from './Loading';

const ResiliencyDashboard = () => {
  const [currentView, setCurrentView] = useState('platforms');
  const [currentTeamName, setCurrentTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const { updateCacheOnRegionChange } = useContext(CacheContext);

  const handleFailoverComplete = () => {
    const failoverCompleteEvent = new CustomEvent('failoverComplete');
    window.dispatchEvent(failoverCompleteEvent);
  };

  const handleFailoverSelectedApps = async (direction) => {
    if (selectedApps.length === 0) {
      alert('Please select at least one application');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to failover the following applications to ${direction.toUpperCase()}?\n${selectedApps.join(
        '\n'
      )}`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await axios.post('/failover/failoveroperation', {
        selected_apps: selectedApps,
        direction,
      });

      alert(`Failover completed:\nSucceeded: ${response.data.succeeded.length}`);
      await fetchFailoverConfig(); // Refresh cache
      setSelectedApps([]);
      handleFailoverComplete(); // Notify other components
    } catch (error) {
      alert(`Error during failover: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailoverConfig().then((data) => {
      updateCacheOnRegionChange(data.applications, data.teams);
    });
  }, []);

  return (
    <div>
      {/* Dashboard UI */}
      {loading && <LoadingIcon />}
    </div>
  );
};

export default ResiliencyDashboard;
