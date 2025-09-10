const axios = require('axios');

const BASE_URL = 'https://backendprod.jarvislabs.net/';

// Create an axios instance with default configuration
const httpClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Make a POST request to the API
 * @param {Object} data - Request body data
 * @param {string} endpoint - API endpoint
 * @param {string} token - Authorization token
 * @param {Object} queryParams - Optional query parameters
 * @returns {Promise<Object>} Response data
 */
async function post(data, endpoint, token, queryParams = null) {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        let url = endpoint;
        if (queryParams) {
            const searchParams = new URLSearchParams(queryParams);
            url += '?' + searchParams.toString();
        }

        const response = await httpClient.post(url, data, config);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            throw new Error(`HTTP ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error: No response received');
        } else {
            // Something else happened
            throw new Error(`Request error: ${error.message}`);
        }
    }
}

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint
 * @param {string} token - Authorization token
 * @param {Object} data - Optional request data (not typically used in GET)
 * @returns {Promise<Object>} Response data
 */
async function get(endpoint, token, data = null) {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await httpClient.get(endpoint, config);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            throw new Error(`HTTP ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error: No response received');
        } else {
            // Something else happened
            throw new Error(`Request error: ${error.message}`);
        }
    }
}

/**
 * Upload files to the API (placeholder function)
 * @param {Object} files - Files to upload
 * @param {string} endpoint - API endpoint
 * @returns {Promise<string>} Response text
 */
async function postFiles(files, endpoint) {
    try {
        const formData = new FormData();
        for (const [key, file] of Object.entries(files)) {
            formData.append(key, file);
        }

        const response = await axios.post(BASE_URL + endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    } catch (error) {
        throw new Error(`File upload error: ${error.message}`);
    }
}

module.exports = {
    post,
    get,
    postFiles
};