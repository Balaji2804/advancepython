const failoverApp = async (appName, direction) => {
  const confirmed = window.confirm(`Are you sure you want to failover ${appName} to ${direction.toUpperCase()}?`);
  if (!confirmed) return;

  setLoading(true);
  try {
    const response = await axios.post('/failover', { app_name: appName, direction });
    const updatedApp = response.data;
    updateApplicationInCache(updatedApp); // Update cache for the app
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

  setLoading(true);
  try {
    const response = await axios.post('/failover', { group_name: groupName, direction });
    alert(response.data.message);
    fetchFailoverConfig(); // Refresh the cache after group failover
  } catch (error) {
    alert(`Failed to failover the group ${groupName}: ${error.response?.data?.detail || 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};
