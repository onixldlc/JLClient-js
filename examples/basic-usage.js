/**
 * Basic usage examples for JLClient-js
 * 
 * This file demonstrates how to use the JLClient-js library
 * to interact with Jarvislabs.ai API
 */

const { Instance, User, FileSystem, setToken } = require('../src/index');

// Example usage function
async function example() {
    // Set your authentication token
    setToken('your-token-here');
    
    try {
        console.log('=== JLClient-js Usage Examples ===\n');

        // 1. Get user balance
        console.log('1. Getting user balance...');
        const balance = await User.getBalance();
        console.log('Balance:', balance);

        // 2. Get available templates
        console.log('\n2. Getting available templates...');
        const templates = await User.getTemplates();
        console.log('Templates:', templates);

        // 3. Get user scripts
        console.log('\n3. Getting user scripts...');
        const scripts = await User.getScripts();
        console.log('Scripts:', scripts);

        // 4. Get existing instances
        console.log('\n4. Getting existing instances...');
        const instances = await User.getInstances();
        console.log(`Found ${instances.length} instances:`);
        instances.forEach(instance => {
            console.log(`- ${instance.name} (${instance.status}) - Machine ID: ${instance.machine_id}`);
        });

        // 5. Create a new GPU instance
        console.log('\n5. Creating a new GPU instance...');
        const newInstance = await Instance.create('GPU', {
            gpu_type: 'RTX5000',
            num_gpus: 1,
            storage: 50,
            template: 'pytorch',
            name: 'example-gpu-instance',
            duration: 'hour'
        });

        if (newInstance.error_message) {
            console.log('Error creating instance:', newInstance.error_message);
        } else {
            console.log('Instance created successfully!');
            console.log(newInstance.toString());

            // 6. Pause the instance
            console.log('\n6. Pausing the instance...');
            const pauseResult = await newInstance.pause();
            console.log('Pause result:', pauseResult);

            // 7. Resume the instance with different configuration
            console.log('\n7. Resuming instance with different storage...');
            const resumeResult = await newInstance.resume({
                storage: 100
            });
            
            if (resumeResult.error_message) {
                console.log('Error resuming instance:', resumeResult.error_message);
            } else {
                console.log('Instance resumed successfully!');
            }

            // 8. Destroy the instance (commented out for safety)
            // console.log('\n8. Destroying the instance...');
            // const destroyResult = await newInstance.destroy();
            // console.log('Destroy result:', destroyResult);
        }

        // 9. FileSystem operations
        console.log('\n9. FileSystem operations...');
        const fs = new FileSystem();
        
        // List existing filesystems
        const fsList = await fs.list();
        console.log('Existing filesystems:', fsList);

        // Create a new filesystem (commented out as it costs money)
        // const newFs = await fs.create('example-fs', 50);
        // console.log('New filesystem:', newFs);

    } catch (error) {
        console.error('Error in example:', error.message);
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    console.log('Note: This example requires a valid authentication token.');
    console.log('Please set your token using setToken() before running API operations.\n');
    
    // Uncomment the line below and add your token to run the example
    // example();
}

module.exports = { example };