const { post, get } = require('./httpclient');

let token = null;

/**
 * Set the authentication token for API calls
 * @param {string} authToken - The authentication token
 */
function setToken(authToken) {
    token = authToken;
}

/**
 * Get the current authentication token
 * @returns {string|null} The current token
 */
function getToken() {
    return token;
}

/**
 * Exception thrown when instance creation fails
 */
class InstanceCreationException extends Error {
    constructor(message = "Failed to create the instance. Please check it.") {
        super(message);
        this.name = "InstanceCreationException";
    }
}

/**
 * Represents a compute instance on Jarvislabs.ai
 */
class Instance {
    constructor({
        hdd,
        gpu_type,
        machine_id,
        num_gpus = null,
        num_cpus = null,
        name = '',
        script_id = '',
        is_reserved = true,
        url = '',
        status = '',
        ssh_str = '',
        endpoints = '',
        duration = 'hour',
        script_args = '',
        http_ports = '',
        template = ''
    }) {
        this.gpu_type = gpu_type;
        this.num_gpus = num_gpus;
        this.num_cpus = num_cpus;
        this.hdd = hdd;
        this.storage = hdd; // Alias for compatibility
        this.name = name;
        this.machine_id = machine_id;
        this.script_id = script_id;
        this.is_reserved = is_reserved;
        this.duration = duration;
        this.script_args = script_args;
        this.http_ports = http_ports;
        this.template = template;
        this.url = url;
        this.endpoints = endpoints;
        this.ssh_str = ssh_str;
        this.status = status;
    }

    /**
     * Pause the running instance
     * @returns {Promise<Object>} Pause response
     */
    async pause() {
        try {
            const pauseResponse = await post(
                {},
                'misc/pause',
                token,
                { machine_id: String(this.machine_id) }
            );
            
            if (pauseResponse.success) {
                this.status = 'Paused';
            }
            
            return pauseResponse;
        } catch (error) {
            return { success: false, error_message: error.message };
        }
    }

    /**
     * Destroy the instance permanently
     * @returns {Promise<Object>} Destroy response
     */
    async destroy() {
        try {
            const destroyResponse = await post(
                {},
                'misc/destroy',
                token,
                { machine_id: this.machine_id }
            );
            
            if (destroyResponse.success) {
                this.status = 'Destroyed';
            }
            
            return destroyResponse;
        } catch (error) {
            return { success: false, error_message: error.message };
        }
    }

    /**
     * Update instance metadata
     * @param {Object} req - Request data
     * @param {Object} machineDetails - Machine details from API
     */
    updateInstanceMeta(req, machineDetails) {
        this.machine_id = machineDetails.machine_id;
        this.gpu_type = req.gpu_type;
        this.num_gpus = req.num_gpus;
        this.hdd = req.hdd;
        this.storage = req.hdd;
        this.is_reserved = req.is_reserved;
        this.name = req.name;
        this.num_cpus = req.num_cpus;
        this.url = machineDetails.url;
        this.endpoints = machineDetails.endpoints;
        this.ssh_str = machineDetails.ssh_str;
        this.status = machineDetails.status;
        this.machine_id = machineDetails.machine_id;
        this.duration = machineDetails.frequency;
        this.template = machineDetails.framework;
    }

    /**
     * Resume a paused instance
     * @param {Object} options - Resume options
     * @returns {Promise<Instance|Object>} Resumed instance or error
     */
    async resume({
        storage = null,
        num_cpus = null,
        num_gpus = null,
        gpu_type = null,
        name = null,
        script_id = null,
        script_args = null,
        is_reserved = null,
        duration = null,
        fs_id = null
    } = {}) {
        const resumeReq = {
            machine_id: this.machine_id,
            hdd: storage || this.hdd,
            name: name || this.name,
            script_id: script_id || this.script_id,
            script_args: script_args || this.script_args,
            duration: duration || this.duration,
            gpu_type: null,
            num_gpus: null,
            num_cpus: null,
            fs_id: fs_id
        };

        if (num_cpus || (this.gpu_type === 'CPU' && !num_gpus)) {
            resumeReq.num_cpus = num_cpus || this.num_cpus;
        } else {
            resumeReq.gpu_type = gpu_type || this.gpu_type;
            resumeReq.num_gpus = num_gpus || this.num_gpus;
            resumeReq.is_reserved = is_reserved !== null ? is_reserved : this.is_reserved;
        }

        try {
            const resumeResp = await post(resumeReq, `templates/${this.template}/resume`, token);
            this.machine_id = resumeResp.machine_id;
            
            const machineDetails = await Instance.getInstanceDetails(this.machine_id);
            this.updateInstanceMeta(resumeReq, machineDetails);
            
            return this;
        } catch (error) {
            if (error instanceof InstanceCreationException) {
                return { error_message: 'Failed to create the instance. Please reach to the team.' };
            }
            return { error_message: "Some unexpected error had occurred. Please reach to the team." };
        }
    }

    /**
     * Get instance details by machine ID
     * @param {number} machineId - Machine ID
     * @returns {Promise<Object>} Machine details
     */
    static async getInstanceDetails(machineId) {
        const maxAttempts = 5;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const machineStatusResponse = await get('users/fetch', token);
                
                const matchingInstances = machineStatusResponse.instances.filter(
                    instance => instance.machine_id === machineId
                );
                
                const machineDetails = matchingInstances.length > 0 ? matchingInstances[0] : null;
                
                if (machineDetails && machineDetails.status === 'Running') {
                    return machineDetails;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                    attempts++;
                }
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    throw new InstanceCreationException();
                }
            }
        }

        if (attempts === maxAttempts) {
            throw new InstanceCreationException();
        }
    }

    /**
     * Create a new instance
     * @param {string} instanceType - 'GPU' or 'CPU'
     * @param {Object} options - Instance creation options
     * @returns {Promise<Instance|Object>} Created instance or error
     */
    static async create(instanceType, {
        gpu_type = 'RTX5000',
        template = 'pytorch',
        num_gpus = 1,
        num_cpus = 1,
        storage = 20,
        name = 'Name me',
        script_id = null,
        image = null,
        script_args = null,
        is_reserved = true,
        duration = 'hour',
        http_ports = '',
        fs_id = null
    } = {}) {
        const reqData = {
            hdd: storage,
            name: name,
            script_id: script_id,
            image: image,
            script_args: script_args,
            is_reserved: is_reserved,
            duration: duration,
            http_ports: http_ports,
            fs_id: fs_id
        };

        const instanceParams = {};

        if (instanceType.toLowerCase() === 'gpu') {
            reqData.gpu_type = gpu_type;
            reqData.num_gpus = num_gpus;
            instanceParams.gpu_type = gpu_type;
            instanceParams.num_gpus = num_gpus;
        } else if (instanceType.toLowerCase() === 'cpu') {
            reqData.num_cpus = num_cpus;
            instanceParams.gpu_type = 'CPU';
            instanceParams.num_cpus = num_cpus;
        }

        try {
            const resp = await post(reqData, `templates/${template}/create`, token);
            const machineId = resp.machine_id;
            const machineDetails = await Instance.getInstanceDetails(machineId);
            
            instanceParams.hdd = storage;
            instanceParams.name = machineDetails.name;
            instanceParams.url = machineDetails.url;
            instanceParams.endpoints = machineDetails.endpoints;
            instanceParams.ssh_str = machineDetails.ssh_str;
            instanceParams.status = machineDetails.status;
            instanceParams.machine_id = machineDetails.machine_id;
            instanceParams.duration = machineDetails.frequency;
            instanceParams.template = machineDetails.framework;

            return new Instance(instanceParams);
        } catch (error) {
            if (error instanceof InstanceCreationException) {
                return { error_message: 'Failed to create the instance. Please reach to the team.' };
            }
            return { error_message: "Some unexpected error had occurred. Please reach to the team." };
        }
    }

    /**
     * String representation of the instance
     * @returns {string} Formatted instance information
     */
    toString() {
        const metadata = [
            `Instance Name: ${this.name}`,
            `Status: ${this.status}`,
            `Machine ID: ${this.machine_id}`,
            `GPU Type: ${this.gpu_type}`,
            `Number of GPUs: ${this.num_gpus}`,
            `Number of CPUs: ${this.num_cpus}`,
            `Storage (GB): ${this.hdd}`,
            `Template: ${this.template}`,
            `Duration: ${this.duration}`,
            `SSH Command: ${this.ssh_str}`,
            `URL: ${this.url}`,
            `Endpoints: ${this.endpoints}`
        ];
        return metadata.join('\n');
    }
}

/**
 * User management class for interacting with user account
 */
class User {
    /**
     * Get all instances for the current user
     * @returns {Promise<Instance[]>} Array of instances
     */
    static async getInstances() {
        try {
            const resp = await get('users/fetch', token);
            const instances = [];
            
            for (const instance of resp.instances) {
                const inst = new Instance({
                    hdd: instance.hdd,
                    gpu_type: instance.gpu_type,
                    name: instance.instance_name,
                    url: instance.url,
                    endpoints: instance.endpoints,
                    ssh_str: instance.ssh_str,
                    status: instance.status,
                    machine_id: instance.machine_id,
                    template: instance.framework,
                    num_gpus: instance.num_gpus
                });
                instances.push(inst);
            }
            
            return instances;
        } catch (error) {
            throw new Error(`Failed to get instances: ${error.message}`);
        }
    }

    /**
     * Get a specific instance by ID
     * @param {number} instanceId - Instance/Machine ID
     * @returns {Promise<Instance|null>} Instance object or null
     */
    static async getInstance(instanceId) {
        if (!instanceId) {
            throw new Error('Pass a valid instance/machine id');
        }
        
        try {
            const instances = await User.getInstances();
            const matchingInstances = instances.filter(
                instance => String(instance.machine_id) === String(instanceId)
            );
            
            if (matchingInstances.length === 1) {
                return matchingInstances[0];
            }
            
            console.log("Invalid machine id");
            return null;
        } catch (error) {
            throw new Error(`Failed to get instance: ${error.message}`);
        }
    }

    /**
     * Get available templates
     * @returns {Promise<Object>} Available templates
     */
    static async getTemplates() {
        try {
            const templates = await get('misc/frameworks', token);
            return {
                templates: templates.frameworks.map(template => template.id)
            };
        } catch (error) {
            throw new Error(`Failed to get templates: ${error.message}`);
        }
    }

    /**
     * Get user account balance
     * @returns {Promise<Object>} Balance information
     */
    static async getBalance() {
        try {
            return await get('users/balance', token);
        } catch (error) {
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }

    /**
     * Get user scripts
     * @returns {Promise<Array>} User scripts
     */
    static async getScripts() {
        try {
            const resp = await get('/scripts/', token);
            return resp.script_meta;
        } catch (error) {
            throw new Error(`Failed to get scripts: ${error.message}`);
        }
    }
}

/**
 * FileSystem management class
 */
class FileSystem {
    /**
     * List all filesystems
     * @returns {Promise<Object>} Filesystem list
     */
    async list() {
        try {
            return await get('filesystem/list', token);
        } catch (error) {
            throw new Error(`Failed to list filesystems: ${error.message}`);
        }
    }

    /**
     * Create a new filesystem
     * @param {string} fsName - Filesystem name
     * @param {number} storage - Storage size
     * @returns {Promise<Object>} Creation response
     */
    async create(fsName, storage) {
        try {
            return await post(
                { fs_name: fsName, storage: storage },
                'filesystem/create',
                token
            );
        } catch (error) {
            throw new Error(`Failed to create filesystem: ${error.message}`);
        }
    }

    /**
     * Delete a filesystem
     * @param {string} fsId - Filesystem ID
     * @returns {Promise<Object>} Deletion response
     */
    async delete(fsId) {
        try {
            return await post(
                {},
                'filesystem/delete',
                token,
                { fs_id: fsId }
            );
        } catch (error) {
            throw new Error(`Failed to delete filesystem: ${error.message}`);
        }
    }
}

module.exports = {
    setToken,
    getToken,
    Instance,
    User,
    FileSystem,
    InstanceCreationException,
    // Legacy export for backward compatibility
    token: {
        get: () => token,
        set: (value) => { token = value; }
    }
};