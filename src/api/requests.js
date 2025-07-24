

const apiUrl = 'http://localhost:3000/';

// General-purpose API request function
export async function apiRequest(method, endpoint = '', body = null) {
  try {
    // Set up request configuration
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
    };

    // Add request body for methods other than GET
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    // Perform the request
    const response = await fetch(`${apiUrl}${endpoint}`, options);

    // Handle error response
    if (!response.ok) throw {
      status: response.status,
      statusText: response.statusText
    };

    // Parse and return JSON response
    const json = await response.json();
    return json;

  } catch (error) {
    // Log a user-friendly error message
    const message = error.statusText || "An error has occurred";
    showMessage(`Error ${error.status}: ${message}`, 'error');
    throw error;
  }
}