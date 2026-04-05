// Retry utility for handling database deadlocks and other transient errors
export const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Check if it's a deadlock or serialization error
      const isDeadlock = error.message && (
        error.message.includes('deadlock') ||
        error.message.includes('SQLSTATE[40001]') ||
        error.message.includes('Serialization failure') ||
        error.message.includes('1213')
      );
      
      if (isDeadlock && attempt < maxRetries) {
        console.log(`Deadlock detected, retrying attempt ${attempt}/${maxRetries}...`);
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Re-throw if not a deadlock or max retries reached
      throw error;
    }
  }
};

// Enhanced fetch with retry logic
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  return retryOperation(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }, maxRetries);
};

// Specific retry functions for different operations
export const retryPOST = (url, data, maxRetries = 3) => {
  return fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }, maxRetries);
};

export const retryPUT = (url, data, maxRetries = 3) => {
  return fetchWithRetry(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }, maxRetries);
};

export const retryDELETE = (url, maxRetries = 3) => {
  return fetchWithRetry(url, {
    method: 'DELETE'
  }, maxRetries);
};

export const retryGET = (url, maxRetries = 3) => {
  return fetchWithRetry(url, {
    method: 'GET'
  }, maxRetries);
};
