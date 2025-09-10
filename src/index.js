/**
 * JLClient-js - JavaScript/Node.js API client for Jarvislabs.ai
 * 
 * Main entry point for the JLClient-js library.
 * Provides functionality to interact with Jarvislabs.ai GPU/CPU powered instances.
 */

const { 
    setToken, 
    getToken, 
    Instance, 
    User, 
    FileSystem, 
    InstanceCreationException 
} = require('./jarvisclient');

// Re-export all functionality
module.exports = {
    // Token management
    setToken,
    getToken,
    
    // Main classes
    Instance,
    User,
    FileSystem,
    
    // Exceptions
    InstanceCreationException,
    
    // Legacy compatibility - allows jlclient.token = 'xyz'
    set token(value) {
        setToken(value);
    },
    
    get token() {
        return getToken();
    }
};

// Default export for ES6 modules compatibility
module.exports.default = module.exports;