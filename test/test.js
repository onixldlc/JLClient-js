/**
 * Basic test file for JLClient-js
 */

const { Instance, User, FileSystem, setToken, getToken } = require('../src/index');

// Test token management
console.log('Testing token management...');
console.log('Initial token:', getToken()); // Should be null

setToken('test-token-123');
console.log('Token after setting:', getToken()); // Should be 'test-token-123'

// Test class instantiation
console.log('\nTesting class instantiation...');

try {
    // Test Instance constructor
    const instance = new Instance({
        hdd: 50,
        gpu_type: 'RTX5000',
        machine_id: 12345,
        num_gpus: 1,
        name: 'test-instance',
        status: 'Running'
    });
    
    console.log('Instance created successfully:');
    console.log('- Name:', instance.name);
    console.log('- GPU Type:', instance.gpu_type);
    console.log('- Storage:', instance.storage, 'GB');
    console.log('- Machine ID:', instance.machine_id);
    console.log('- Status:', instance.status);
    
    // Test toString method
    console.log('\nInstance toString():');
    console.log(instance.toString());
    
} catch (error) {
    console.error('Error creating Instance:', error.message);
}

// Test FileSystem instantiation
try {
    const fs = new FileSystem();
    console.log('\nFileSystem instantiated successfully');
} catch (error) {
    console.error('Error creating FileSystem:', error.message);
}

// Test import structure
console.log('\nTesting module exports...');
const jlclient = require('../src/index');
console.log('Available exports:', Object.keys(jlclient));

// Test legacy token compatibility
console.log('\nTesting legacy token compatibility...');
jlclient.token = 'legacy-token-456';
console.log('Token after legacy setting:', getToken()); // Should be 'legacy-token-456'

console.log('\nAll basic tests completed successfully!');

// Note: API tests would require a real token and would make actual API calls
console.log('\nNote: API functionality tests require a valid authentication token');
console.log('and will make actual API calls to Jarvislabs.ai endpoints.');