# JLClient-js

This is project is a JavaScript/Node.js wrapper for [jarvislabsai/jlclient](https://github.com/jarvislabsai/jlclient) API client for interacting with Jarvislabs.ai for creating GPU/CPU powered instances on top of A100, A6000, RTX 5000 and RTX6000Ada.

>[!warning]
>This project is not maintained by the original author(s) or official community. And use this lib at your own discretion. \
>The original JLClient python implementation can be accesed here [jarvislabsai/jlclient](https://github.com/jarvislabsai/jlclient)

## Installation

```shell
npm install jlclient-js
```

### Imports and configuration

```javascript
const { Instance, User, FileSystem, setToken } = require('jlclient-js');

// Alternative import syntax
const jlclient = require('jlclient-js');

// Set your authentication token
setToken('**************************duWRbO68IiMTkQKWi48');

// Alternative token setting (legacy compatibility)
jlclient.token = '**************************duWRbO68IiMTkQKWi48';
```

Generate a token from [here](https://cloud.jarvislabs.ai/settings#api).

## Managing GPU/CPU powered instances on Jarvislabs.ai

### Create

| Parameter           | Type | Description/Values                                                        | Default Value |
| ------------------- | ---- | ------------------------------------------------------------------------- | ------------- |
| instance_type       | str  | Choose between 'GPU' or 'CPU'.                                           | 'GPU'         |
| num_gpus / num_cpus | int  | Choose between 1 to 8 for GPU instance.                                  | 1             |
| gpu_type            | str  | Choose from **A100**, **RTX6000Ada**, **A5000**, **A6000**, **RTX5000**. | RTX5000       |
| template            | str  | Use `User.getTemplates()` to get all templates.                          | pytorch       |
| script_id           | str  | Use `User.getScripts()` to get all script ids and pass it.               | null          |
| is_reserved         | bool | true refers to an on-demand instance. false refers to a spot instance.   | true          |
| duration            | str  | Choose hour, week, and month. The pricing changes based on the duration.  | hour          |
| http_ports          | str  | As per your requirement, you can specify the ports.                       | null          |
| storage             | int  | Choose between 20GB to 2TB.                                              | 20            |

```javascript
// CPU Instance Example
const cpuInstance = await Instance.create('CPU', {
    num_cpus: 1,
    storage: 25,
    template: 'pytorch',
    name: 'cpu instance'
});

// GPU Instance Example
const gpuInstance = await Instance.create('GPU', {
    gpu_type: 'RTX6000Ada',
    num_gpus: 1,
    storage: 50,
    template: 'pytorch',
    name: 'gpu instance'
});
```

This should return the Instance object, which includes the following attributes:

- gpu_type
- num_gpus
- num_cpus
- storage (alias for hdd)
- name
- machine_id
- script_id
- is_reserved
- duration
- script_args
- http_ports
- template
- url
- endpoints
- ssh_str
- status

If the Instance object isn't returned, an error dictionary will be provided.

**Note:** Please contact us if you encounter any errors while launching the instance.

### Pause

```javascript
await instance.pause();
```

#### Pause existing Instance

```javascript
// Get the running Instance
const instance = await User.getInstance(12345);

await instance.pause();
```

You can call `pause()` on any `Instance` object.

### Resume

```javascript
// Example 1: Resume with same configuration
await instance.resume();

// Example 2: Resume with different configuration
await instance.resume({
    num_gpus: 1,
    gpu_type: 'RTX5000',
    storage: 100
});

// Switching GPU to CPU Instance, pass the num_cpus parameter
await instance.resume({
    num_cpus: 1,
    storage: 25
});

// Switching CPU to GPU Instance, pass the num_gpus & gpu_type
await instance.resume({
    gpu_type: 'RTX6000Ada',
    num_gpus: 1,
    storage: 25
});
```

#### Resume existing Instance

```javascript
// Get the paused Instance
const instance = await User.getInstance(12345);

// Resuming the old instance
const newInstance = await instance.resume();
```

You can modify an existing instance by changing the below `resume` parameters:

- num_gpus
- gpu_type
- storage

or just call `resume()` to start with the same configuration.

### Destroy

```javascript
await instance.destroy();
```

#### Destroy the existing Instance

```javascript
// Get the paused or running Instance
const instance = await User.getInstance(12345);

await instance.destroy();
```

Invoking the destroy method on any instance object will permanently delete the instance and it cannot be retrieved.

## User management

The `User` class comes with the below key functionalities:

- `User.getTemplates()` : Returns the list of templates.
- `User.getInstances()` : Returns a list of `Instance` objects representing instances in your account.
- `User.getInstance()` : Returns the `Instance` object.
- `User.getBalance()` : Return the balance of the user.
- `User.getScripts()` : Return the list of scripts of the user

### Get the scripts of the User

```javascript
const scripts = await User.getScripts();

/*
scripts = [
    { script_id: 123, script_name: 'script1.sh' },
    { script_id: 124, script_name: 'script2.sh' }
]
*/
```

Invoking `User.getScripts()` method to retrieve the scripts associated with the User.

## Error Handling

All async methods can throw errors. It's recommended to use try-catch blocks:

```javascript
try {
    const instance = await Instance.create('GPU', {
        gpu_type: 'A100',
        num_gpus: 2,
        storage: 100,
        name: 'my-gpu-instance'
    });
    console.log('Instance created:', instance.toString());
} catch (error) {
    console.error('Failed to create instance:', error.message);
}
```

## TypeScript Support

This library includes TypeScript definitions. You can use it with TypeScript:

```typescript
import { Instance, User, setToken, InstanceOptions } from 'jlclient-js';

setToken('your-token-here');

const options: InstanceOptions = {
    gpu_type: 'A100',
    num_gpus: 1,
    storage: 50,
    template: 'pytorch'
};

const instance = await Instance.create('GPU', options);
```

## Issues/Feature request

Do you like to see any new features? We are all ears. You can drop us an email to hello@jarvislabs.ai or chat with us for any new features or issues.

## License

This project is licensed under the terms of the MIT license.
