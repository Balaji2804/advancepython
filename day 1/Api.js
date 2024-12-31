import axios from 'axios';

// Fetch failover logs
export const fetchFailoverData = async () => {
  try {
    const response = await axios.get('/failover/logs');
    return response.data;
  } catch (err) {
    console.error('Error fetching failover logs:', err);
    throw err;
  }
};

// Fetch failover configuration
export const fetchFailoverConfig = async () => {
  try {
    const response = await axios.get('/failover/config');
    return response.data;
  } catch (err) {
    console.error('Error fetching failover configuration:', err);
    throw err;
  }
};
