# JLClient-js Source Code

JavaScript/Node.js client code for interacting with Jarvislabs.ai

## File Structure

- `index.js` - Main entry point, exports all functionality
- `index.d.ts` - TypeScript type definitions
- `jarvisclient.js` - Core client classes (Instance, User, FileSystem)
- `httpclient.js` - HTTP client utilities using Axios
- `README.md` - This file

## Main Classes

### Instance
Manages GPU/CPU compute instances with methods for:
- Creating instances (`Instance.create()`)
- Pausing instances (`instance.pause()`)
- Resuming instances (`instance.resume()`)
- Destroying instances (`instance.destroy()`)

### User
User account management with methods for:
- Getting instances (`User.getInstances()`)
- Getting specific instance (`User.getInstance()`)
- Getting templates (`User.getTemplates()`)
- Getting balance (`User.getBalance()`)
- Getting scripts (`User.getScripts()`)

### FileSystem
File system management with methods for:
- Listing filesystems (`fileSystem.list()`)
- Creating filesystems (`fileSystem.create()`)
- Deleting filesystems (`fileSystem.delete()`)

## Authentication

All API calls require an authentication token which can be set using:
```javascript
const { setToken } = require('jlclient-js');
setToken('your-token-here');
```

Generate a token from [Jarvislabs.ai Settings](https://cloud.jarvislabs.ai/settings#api).