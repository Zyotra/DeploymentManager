# Deployment Manager API - Technical Documentation

## Table of Contents

1. [Route Analysis](#route-analysis)
2. [Function Analysis](#function-analysis)
3. [Command Deep-Dive](#command-deep-dive)
4. [Security Analysis](#security-analysis)
5. [Data Flow](#data-flow)
6. [Database Operations](#database-operations)
7. [Error Handling](#error-handling)

---

## Route Analysis

### 1. Root Endpoint

**Route Path**: `/`  
**HTTP Method**: GET  
**Purpose**: Welcome endpoint that returns API information  
**Authentication**: Not protected (`isProtected: false`)  
**Request Parameters**: None  
**Response Format**:
```json
{
  "status": "success",
  "message": "Welcome to the Deployment Manager API of Zyotra",
  "Time": "2024-01-01T00:00:00.000Z"
}
```
**Status Code**: 200 OK  
**Database Operations**: None  
**External Services**: None

---

### 2. Add Machine

**Route Path**: `/add-machine`  
**HTTP Method**: POST  
**Purpose**: Register a new VPS machine in the system  
**Authentication**: Protected (requires JWT token via `checkAuth` middleware)  
**Request Parameters**:
- **Body**:
  ```typescript
  {
    vpsIP: string;          // VPS IP address
    vpsName: string;        // Machine name
    vpsPassword: string;    // Root password (will be encrypted)
    sshKey?: string;        // Optional SSH key (will be encrypted)
    ram: number;            // RAM in MB
    cpuCores: number;       // CPU core count
    storage: number;        // Storage in GB
    region: string;         // VPS region
    expiryDate: string;     // ISO date string
  }
  ```
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (201 Created):
  ```json
  {
    "status": "success",
    "data": [{
      "id": 1,
      "vps_ip": "192.168.1.1",
      "vps_name": "My VPS",
      "vps_password": "<encrypted>",
      "ownerId": 123,
      "ram": 4096,
      "storage": 100,
      "cpu_cores": 4,
      "expiryDate": "2024-12-31T00:00:00.000Z",
      "added_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }]
  }
  ```
- **Error** (400/401/500):
  ```json
  {
    "status": "error",
    "message": "Error description"
  }
  ```

**Database Operations**:
- **Table**: `vpsMachines`
- **Operation**: `INSERT` with encrypted password and optional SSH key
- **Returns**: Inserted record with generated ID

**External Services**: None  
**Security Considerations**:
- Password encrypted before storage using AES encryption
- SSH key encrypted if provided
- User ID extracted from JWT token (prevents impersonation)
- Input validation for required fields

---

### 3. Get Machines

**Route Path**: `/get-machines`  
**HTTP Method**: GET  
**Purpose**: Retrieve all VPS machines owned by the authenticated user  
**Authentication**: Protected  
**Request Parameters**:
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "vps_ip": "192.168.1.1",
        "vps_name": "My VPS",
        "vps_password": "<encrypted>",
        "ownerId": 123,
        "ram": 4096,
        "storage": 100,
        "cpu_cores": 4,
        "expiryDate": "2024-12-31T00:00:00.000Z",
        "added_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

**Database Operations**:
- **Table**: `vpsMachines`
- **Operation**: `SELECT` filtered by `ownerId = userId`
- **Query**: `SELECT * FROM vps_machines WHERE ownerId = ?`

**External Services**: None  
**Security Considerations**:
- Only returns machines owned by the authenticated user
- Passwords remain encrypted in response

---

### 4. Update Machine

**Route Path**: `/update-machine/:id`  
**HTTP Method**: PUT  
**Purpose**: Update VPS password or expiry date  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (machine ID)
- **Body**:
  ```typescript
  {
    newVpsPassword?: string;  // Optional new password
    expiryDate?: string;      // Optional new expiry date (ISO string)
  }
  ```
- **Headers**: `Cookie: accessToken=<jwt_token>`

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "data": { /* update result */ }
  }
  ```
- **Error** (400/404/500):
  ```json
  {
    "status": "error",
    "message": "Error description"
  }
  ```

**Database Operations**:
- **Table**: `vpsMachines`
- **Operation**: `UPDATE` with dynamic fields
- **Query**: `UPDATE vps_machines SET vps_password = ?, expiryDate = ? WHERE id = ?`

**External Services**: None  
**Security Considerations**:
- Validates machine exists before update
- Password encrypted before storage
- No owner verification (potential security issue - should check ownership)

---

### 5. Delete Machine

**Route Path**: `/delete-machine/:id`  
**HTTP Method**: DELETE  
**Purpose**: Remove a VPS machine from the system  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (machine ID)
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "message": "Machine deleted successfully"
  }
  ```
- **Error** (400/401/404/500):
  ```json
  {
    "status": "error",
    "message": "Error description"
  }
  ```

**Database Operations**:
- **Table**: `vpsMachines`
- **Operation**: `DELETE` with ownership verification
- **Query**: `DELETE FROM vps_machines WHERE id = ? AND ownerId = ?`

**External Services**: None  
**Security Considerations**:
- Verifies machine exists
- Verifies ownership before deletion
- Prevents unauthorized deletion

---

### 6. Get Machine Analytics

**Route Path**: `/get-machine-analytics/:id`  
**HTTP Method**: GET  
**Purpose**: Retrieve real-time system information from a VPS  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (machine ID)
- **Headers**: `Cookie: accessToken=<jwt_token>`

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "message": "Machine details fetched successfully",
    "data": {
      "memory": "Mem: 4096 1024 3072...",
      "disk": "Filesystem Size Used Avail...",
      "cpu": "model name : Intel(R) Core(TM)...",
      "os": "Operating System: Ubuntu 22.04...",
      "processes": "top output..."
    }
  }
  ```

**Database Operations**:
- **Table**: `vpsMachines`
- **Operation**: `SELECT` by ID
- **Query**: `SELECT * FROM vps_machines WHERE id = ? LIMIT 1`

**External Services**: SSH connection to VPS  
**Security Considerations**:
- Decrypts password for SSH connection
- No ownership verification (potential security issue)
- SSH connection properly closed in finally block

**SSH Commands Executed**:
1. `free -m` - Memory usage
2. `df -h` - Disk usage
3. `cat /proc/cpuinfo | grep 'model name' | uniq` - CPU info
4. `hostnamectl | grep 'Operating System'` - OS info
5. `top -b -n 1` - Process list

---

### 7. Add Domain

**Route Path**: `/add-domain`  
**HTTP Method**: POST  
**Purpose**: Register a new domain for a VPS  
**Authentication**: Protected  
**Request Parameters**:
- **Body**:
  ```typescript
  {
    domainAddress: string;  // Domain name (e.g., example.com)
    vpsIp: string;          // Associated VPS IP
  }
  ```
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "data": [{
      "id": 1,
      "domain_address": "example.com",
      "vps_ip": "192.168.1.1",
      "ownerId": 123,
      "isDeployed": 0,
      "added_at": "2024-01-01T00:00:00.000Z"
    }]
  }
  ```

**Database Operations**:
- **Table**: `userDomains`
- **Operation**: `INSERT`
- **Query**: `INSERT INTO user_domains (domain_address, vps_ip, ownerId) VALUES (?, ?, ?)`

**External Services**: None  
**Security Considerations**:
- Input validation for required fields
- User ID from JWT token

---

### 8. Get Domains

**Route Path**: `/get-domains`  
**HTTP Method**: GET  
**Purpose**: Retrieve all domains owned by the authenticated user  
**Authentication**: Protected  
**Request Parameters**:
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "domain_address": "example.com",
        "vps_ip": "192.168.1.1",
        "ownerId": 123,
        "isDeployed": 0,
        "added_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

**Database Operations**:
- **Table**: `userDomains`
- **Operation**: `SELECT` filtered by `ownerId`
- **Query**: `SELECT * FROM user_domains WHERE ownerId = ?`

**External Services**: None  
**Security Considerations**:
- Only returns domains owned by authenticated user

---

### 9. Delete Domain

**Route Path**: `/delete-domain/:id`  
**HTTP Method**: DELETE  
**Purpose**: Remove a domain from the system  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (domain ID)
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "message": "Domain deleted successfully"
  }
  ```
- **Error** (403/404/401):
  ```json
  {
    "status": "error",
    "message": "Cannot delete a deployed domain. Please undeploy it first."
  }
  ```

**Database Operations**:
- **Table**: `userDomains`
- **Operation**: `SELECT` then `DELETE` with ownership verification
- **Query**: `DELETE FROM user_domains WHERE id = ?`

**External Services**: None  
**Security Considerations**:
- Verifies domain exists
- Verifies ownership
- Prevents deletion of deployed domains (`isDeployed = 1`)

---

### 10. Authenticate GitHub

**Route Path**: `/authenticate-github/:id`  
**HTTP Method**: POST  
**Purpose**: Configure GitHub authentication on a VPS machine  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (VPS ID)
- **Body**:
  ```typescript
  {
    githubUsername: string;  // GitHub username
    githubToken: string;      // GitHub personal access token
  }
  ```
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "message": "VPS authenticated successfully"
  }
  ```
- **Error** (400/404/500):
  ```json
  {
    "status": "error",
    "message": "Failed to authenticate VPS with GitHub",
    "error": "Detailed error message"
  }
  ```

**Database Operations**:
- **Tables**: `vpsMachines` (SELECT), `githubAuths` (INSERT)
- **Queries**:
  - `SELECT * FROM vps_machines WHERE id = ? AND ownerId = ?`
  - `INSERT INTO github_auths (vpsId, github_username) VALUES (?, ?)`

**External Services**: 
- SSH connection to VPS
- GitHub API (for token validation)

**Security Considerations**:
- Verifies VPS ownership
- Validates GitHub token via API
- Stores credentials securely on VPS
- Cleans up on error (rollback)

**SSH Commands Executed**:
1. `sudo apt install -y git curl` - Install git and curl
2. `curl -f -s -H "Authorization: token ${token}" https://api.github.com/users/${username} > /dev/null` - Validate token
3. `git config --global credential.helper store` - Configure git credential helper
4. `echo "https://${username}:${token}@github.com" > ~/.git-credentials` - Store credentials
5. `chmod 600 ~/.git-credentials` - Secure credential file

---

### 11. Unauthenticate GitHub

**Route Path**: `/unauthenticate-github/:id`  
**HTTP Method**: GET  
**Purpose**: Remove GitHub authentication from a VPS  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (VPS ID)
- **Headers**: `Cookie: accessToken=<jwt_token>`
- **Context**: `userId` (from JWT middleware)

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "message": "VPS unauthenticated from GitHub successfully"
  }
  ```

**Database Operations**:
- **Tables**: `vpsMachines` (SELECT), `githubAuths` (DELETE)
- **Queries**:
  - `SELECT * FROM vps_machines WHERE id = ? AND ownerId = ?`
  - `DELETE FROM github_auths WHERE vpsId = ?`

**External Services**: SSH connection to VPS

**SSH Commands Executed**:
1. `sudo rm -f ~/.git-credentials || true` - Remove credential file
2. `git config --global --unset credential.helper || true` - Unset credential helper

---

### 12. Get GitHub Status

**Route Path**: `/get-github-auths/:id`  
**HTTP Method**: GET  
**Purpose**: Check GitHub authentication status for a VPS  
**Authentication**: Protected  
**Request Parameters**:
- **Path**: `id` (VPS ID)
- **Headers**: `Cookie: accessToken=<jwt_token>`

**Response Format**:
- **Success** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "vpsId": 5,
      "github_username": "username",
      "added_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error** (404):
  ```json
  {
    "status": "error",
    "message": "No GitHub authentication found for the specified VPS"
  }
  ```

**Database Operations**:
- **Table**: `githubAuths`
- **Operation**: `SELECT` by `vpsId`
- **Query**: `SELECT * FROM github_auths WHERE vpsId = ?`

**External Services**: None  
**Security Considerations**:
- No ownership verification (potential security issue)

---

## Function Analysis

### Core Application Functions

#### `index.ts` - Application Entry Point

**Function**: `app.listen(Number(process.env.PORT))`  
**Purpose**: Initialize and start the Elysia server  
**Parameters**: None  
**Return Value**: Server instance  
**Logic Flow**:
1. Load environment variables via `dotenv`
2. Create Elysia app instance
3. Configure CORS middleware
4. Register routes with authentication middleware
5. Start listening on configured port

**Dependencies**:
- `routes` - Route definitions
- `checkAuthPlugin` - Authentication middleware
- `@elysiajs/cors` - CORS handling

**CORS Configuration**:
- **Origins**: `http://localhost:5173`, `https://zyotraportal.ramkrishna.cloud`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Credentials**: Enabled
- **Headers**: Content-Type, Authorization

---

#### `routes.ts` - Route Definitions

**Function**: Route array export  
**Purpose**: Centralized route configuration  
**Structure**: Array of `apiRoute` objects  
**Route Registration Logic**:
- Protected routes: Wrapped with `checkAuthPlugin` middleware
- Public routes: Direct registration
- Dynamic routing based on `isProtected` flag

---

### Authentication Functions

#### `checkAuth.ts` - Authentication Middleware

**Function**: `checkAuthPlugin`  
**Purpose**: Verify JWT token and extract user ID  
**Parameters**: 
- `headers`: Request headers
- `cookie`: Request cookies (accessToken)
- `set`: Response setter

**Return Value**: 
- Success: `{ userId: number }`
- Failure: `{ message: string }` with 419 status

**Logic Flow**:
1. Extract `accessToken` from cookies
2. If missing, return 419 status
3. Verify token using `verifyAccessToken`
4. If invalid, return 419 status
5. Return userId from decoded token

**Error Handling**:
- Missing token: 419 Expired Token
- Invalid token: 419 Expired Token
- Missing userId: 419 Unauthorized

**Dependencies**:
- `verifyAccessToken` from `jwt/verifyTokens`
- `StatusCode` enum

---

#### `verifyTokens.ts` - JWT Verification

**Function**: `verifyAccessToken(token: string)`  
**Purpose**: Verify and decode JWT access token  
**Parameters**:
- `token`: JWT token string

**Return Value**:
- Success: `{ userId: string }`
- Failure: `false`

**Logic Flow**:
1. Use `jwt.verify()` with `ACCESS_TOKEN_SECRET`
2. Extract `userId` from payload
3. Return decoded user info or false on error

**Error Handling**:
- Catches all JWT errors and returns false
- Logs decoded token payload for debugging

**Security Considerations**:
- Uses secret from environment variables
- Handles expired/invalid tokens gracefully

---

### Encryption Functions

#### `encryptVpsPassword.ts` - Password Encryption

**Function**: `encryptVpsPassword(password: string)`  
**Purpose**: Encrypt VPS passwords before database storage  
**Parameters**:
- `password`: Plain text password

**Return Value**: Encrypted string (Base64)

**Logic Flow**:
1. Get encryption algorithm from `ENCRYPTION_ALGORITHM` env var
2. Get encryption key from `ENCRYPTION_KEY` env var
3. Use CryptoJS to encrypt password
4. Return Base64 encoded string

**Error Handling**:
- Throws error if algorithm not specified
- Throws error if encryption fails

**Security Considerations**:
- Uses AES encryption (configurable)
- Key stored in environment variables
- Passwords never stored in plain text

**Dependencies**:
- `crypto-js` library
- Environment variables: `ENCRYPTION_ALGORITHM`, `ENCRYPTION_KEY`

---

#### `decryptVpsPassword.ts` - Password Decryption

**Function**: `decryptVpsPassword(encryptedPassword: string)`  
**Purpose**: Decrypt VPS passwords for SSH connections  
**Parameters**:
- `encryptedPassword`: Encrypted password string

**Return Value**: Decrypted plain text password

**Logic Flow**:
1. Get encryption algorithm from env var
2. Get encryption key from env var
3. Use CryptoJS to decrypt password
4. Convert to UTF-8 string
5. Return plain text password

**Error Handling**:
- Throws error if algorithm not specified
- Throws error if decryption fails

**Security Considerations**:
- Only used when password needed for SSH
- Decrypted password not logged or stored

**Dependencies**:
- `crypto-js` library
- Environment variables: `ENCRYPTION_ALGORITHM`, `ENCRYPTION_KEY`

---

### SSH Client Functions

#### `SSHClient.ts` - SSH Connection Manager

**Class**: `SSHClient`  
**Purpose**: Manage SSH connections and execute remote commands  
**Constructor Parameters**:
```typescript
{
  host: string;      // VPS IP address
  username: string;  // SSH username (usually "root")
  password: string;  // SSH password (decrypted)
  port?: number;     // SSH port (default: 22)
}
```

**Methods**:

##### `connect(): Promise<void>`
**Purpose**: Establish SSH connection  
**Return Value**: Promise that resolves on connection  
**Logic Flow**:
1. Create new SSH2 Client instance
2. Set up event listeners
3. Connect with provided config
4. Resolve on 'ready' event
5. Reject on 'error' event

**Error Handling**:
- Connection timeout
- Authentication failure
- Network errors

---

##### `exec(command: string, onLog?: (chunk: string) => void): Promise<CommandResult>`
**Purpose**: Execute a single command on remote server  
**Parameters**:
- `command`: Shell command to execute
- `onLog`: Optional callback for real-time output

**Return Value**: 
```typescript
{
  command: string;
  output: string;
  exitCode: number;
}
```

**Logic Flow**:
1. Execute command via SSH2 `exec()`
2. Collect stdout and stderr
3. Call `onLog` callback for each chunk
4. Wait for command completion
5. Return result with exit code

**Error Handling**:
- Command execution errors
- Stream errors
- Exit code tracking

**Security Considerations**:
- Commands executed as root user
- Output logged for debugging
- No command sanitization (potential injection risk)

---

##### `runSequential(commands: string[], onLog?: (chunk: string) => void): Promise<CommandResult[]>`
**Purpose**: Execute multiple commands sequentially  
**Parameters**:
- `commands`: Array of shell commands
- `onLog`: Optional callback for output

**Return Value**: Array of CommandResult objects

**Logic Flow**:
1. Iterate through commands array
2. Execute each command via `exec()`
3. Check exit code
4. If non-zero, throw error and stop
5. Return all results

**Error Handling**:
- Stops on first command failure
- Throws error with command and exit code
- All previous commands remain executed

**Security Considerations**:
- Commands executed in order
- Failure stops subsequent commands
- No rollback mechanism

---

##### `close(): void`
**Purpose**: Close SSH connection  
**Return Value**: None  
**Logic Flow**:
1. Call `conn.end()` to close connection
2. Clean up resources

---

### Controller Functions

#### `addMachine` - Add VPS Machine

**File**: `controllers/Machines/addMachines.ts`  
**Function**: `addMachine({ set, body, userId })`  
**Purpose**: Register a new VPS machine  
**Parameters**:
- `set`: Response setter
- `body`: Request body with VPS details
- `userId`: Authenticated user ID (from middleware)

**Return Value**: Success/error response object

**Logic Flow**:
1. Validate userId exists
2. Validate required fields (vpsIP, vpsName, vpsPassword, expiryDate)
3. Encrypt password using `encryptVpsPassword`
4. Encrypt SSH key if provided
5. Insert into database
6. Return created record

**Error Handling**:
- Missing userId: 401 Unauthorized
- Missing fields: 403 Forbidden
- Database errors: 500 Internal Server Error

**Database Operations**:
- Table: `vpsMachines`
- Operation: INSERT
- Fields: All VPS details with encrypted password

---

#### `getMachines` - Get User's Machines

**File**: `controllers/Machines/getMachines.ts`  
**Function**: `getMachines({ userId, set })`  
**Purpose**: Retrieve all machines owned by user  
**Parameters**:
- `userId`: Authenticated user ID
- `set`: Response setter

**Return Value**: Array of machine objects

**Logic Flow**:
1. Validate userId exists
2. Query database for machines where `ownerId = userId`
3. Return all matching records

**Error Handling**:
- Missing userId: 404 Not Found
- Database errors: 500 Internal Server Error

**Database Operations**:
- Table: `vpsMachines`
- Operation: SELECT with WHERE clause
- Filter: `ownerId = userId`

---

#### `updateMachine` - Update Machine

**File**: `controllers/Machines/updateMachine.ts`  
**Function**: `updateMachine({ set, body, params })`  
**Purpose**: Update machine password or expiry date  
**Parameters**:
- `set`: Response setter
- `body`: Update fields (newVpsPassword, expiryDate)
- `params`: Route parameters (id)

**Return Value**: Update result

**Logic Flow**:
1. Validate machine ID exists
2. Validate at least one field to update
3. Check machine exists in database
4. Build dynamic update object
5. Encrypt password if provided
6. Update database record
7. Return update result

**Error Handling**:
- Missing ID: 403 Forbidden
- No update fields: 403 Forbidden
- Machine not found: 404 Not Found
- Database errors: 500 Internal Server Error

**Security Considerations**:
- **ISSUE**: No ownership verification - any authenticated user can update any machine

**Database Operations**:
- Table: `vpsMachines`
- Operation: UPDATE with dynamic SET clause

---

#### `deleteMachine` - Delete Machine

**File**: `controllers/Machines/deleteMachine.ts`  
**Function**: `deleteMachine({ set, params, userId })`  
**Purpose**: Remove a machine from the system  
**Parameters**:
- `set`: Response setter
- `params`: Route parameters (id)
- `userId`: Authenticated user ID

**Return Value**: Success/error response

**Logic Flow**:
1. Validate machine ID exists
2. Query database for machine
3. Verify machine exists
4. Verify ownership (`ownerId === userId`)
5. Delete machine record
6. Return success message

**Error Handling**:
- Missing ID: 403 Forbidden
- Machine not found: 404 Not Found
- Unauthorized: 401 Unauthorized
- Database errors: 500 Internal Server Error

**Security Considerations**:
- Ownership verification implemented
- Prevents unauthorized deletion

**Database Operations**:
- Table: `vpsMachines`
- Operation: DELETE with WHERE clause

---

#### `viewDetails` - Get Machine Analytics

**File**: `controllers/Machines/viewDetails.ts`  
**Function**: `viewDetails({ params, set })`  
**Purpose**: Retrieve real-time system information from VPS  
**Parameters**:
- `params`: Route parameters (id)
- `set`: Response setter

**Return Value**: Machine analytics object

**Logic Flow**:
1. Extract machine ID from params
2. Query database for machine
3. Verify machine exists
4. Decrypt VPS password
5. Create SSH client
6. Connect to VPS
7. Execute system commands sequentially
8. Parse and return results
9. Close SSH connection

**Error Handling**:
- Machine not found: 404 Not Found
- SSH connection errors: 500 Internal Server Error
- Command execution errors: 500 Internal Server Error
- Always closes SSH connection in finally block

**Security Considerations**:
- **ISSUE**: No ownership verification - any authenticated user can view any machine's analytics
- Password decrypted only for SSH connection
- SSH connection properly closed

**Database Operations**:
- Table: `vpsMachines`
- Operation: SELECT by ID

**SSH Commands**: See [Command Deep-Dive](#command-deep-dive) section

---

#### `addNewDomain` - Add Domain

**File**: `controllers/Domains/addNewDomain.ts`  
**Function**: `addNewDomain({ body, set, userId })`  
**Purpose**: Register a new domain  
**Parameters**:
- `body`: Domain details (domainAddress, vpsIp)
- `set`: Response setter
- `userId`: Authenticated user ID

**Return Value**: Created domain object

**Logic Flow**:
1. Validate required fields
2. Insert domain into database
3. Return created record

**Error Handling**:
- Missing fields: 400 Bad Request
- Database errors: 500 Internal Server Error

**Database Operations**:
- Table: `userDomains`
- Operation: INSERT

---

#### `getDomains` - Get User's Domains

**File**: `controllers/Domains/getDomains.ts`  
**Function**: `getDomains({ userId, set })`  
**Purpose**: Retrieve all domains owned by user  
**Parameters**:
- `userId`: Authenticated user ID
- `set`: Response setter

**Return Value**: Array of domain objects

**Logic Flow**:
1. Validate userId exists
2. Query database for domains where `ownerId = userId`
3. Return matching records

**Error Handling**:
- Missing userId: 403 Forbidden
- Database errors: 500 Internal Server Error

**Database Operations**:
- Table: `userDomains`
- Operation: SELECT with WHERE clause

---

#### `deleteDomain` - Delete Domain

**File**: `controllers/Domains/deleteDomain.ts`  
**Function**: `deleteDomain({ params, set, userId })`  
**Purpose**: Remove a domain from the system  
**Parameters**:
- `params`: Route parameters (id)
- `set`: Response setter
- `userId`: Authenticated user ID

**Return Value**: Success/error response

**Logic Flow**:
1. Validate domain ID exists
2. Query database for domain
3. Verify domain exists
4. Verify ownership
5. Check if domain is deployed (`isDeployed === 1`)
6. If deployed, return error
7. Delete domain record
8. Return success message

**Error Handling**:
- Missing ID: 403 Forbidden
- Domain not found: 404 Not Found
- Unauthorized: 401 Unauthorized
- Deployed domain: 403 Forbidden
- Database errors: 500 Internal Server Error

**Security Considerations**:
- Ownership verification implemented
- Prevents deletion of deployed domains

**Database Operations**:
- Table: `userDomains`
- Operation: DELETE

---

#### `authenticateGithubController` - Authenticate GitHub

**File**: `controllers/Github/authenticateGithubController.ts`  
**Function**: `authenticateGithubController({ body, params, userId, set })`  
**Purpose**: Configure GitHub authentication on a VPS  
**Parameters**:
- `body`: GitHub credentials (githubUsername, githubToken)
- `params`: Route parameters (id - VPS ID)
- `userId`: Authenticated user ID
- `set`: Response setter

**Return Value**: Success/error response

**Logic Flow**:
1. Validate required fields (vpsId, userId, username, token)
2. Query database for VPS with ownership check
3. Verify VPS exists and belongs to user
4. Decrypt VPS password
5. Create SSH client
6. Connect to VPS
7. Execute GitHub authentication commands:
   - Install git and curl
   - Validate GitHub token
   - Configure git credential helper
   - Store credentials securely
8. Insert GitHub auth record into database
9. Return success message
10. On error: Clean up credentials and close connection

**Error Handling**:
- Missing fields: 400 Bad Request
- VPS not found/unauthorized: 404 Not Found
- SSH errors: 500 Internal Server Error
- Command failures: 500 Internal Server Error
- Always cleans up on error (rollback)

**Security Considerations**:
- Ownership verification implemented
- GitHub token validated via API
- Credentials stored securely (chmod 600)
- Rollback on failure

**Database Operations**:
- Tables: `vpsMachines` (SELECT), `githubAuths` (INSERT)

**SSH Commands**: See [Command Deep-Dive](#command-deep-dive) section

---

#### `unauthenticateGithubController` - Remove GitHub Auth

**File**: `controllers/Github/unauthenticateGithubController.ts`  
**Function**: `unauthenticateGithubController({ params, userId, set })`  
**Purpose**: Remove GitHub authentication from a VPS  
**Parameters**:
- `params`: Route parameters (id - VPS ID)
- `userId`: Authenticated user ID
- `set`: Response setter

**Return Value**: Success/error response

**Logic Flow**:
1. Validate required fields (vpsId, userId)
2. Query database for VPS with ownership check
3. Verify VPS exists and belongs to user
4. Decrypt VPS password
5. Create SSH client
6. Connect to VPS
7. Execute cleanup commands:
   - Remove credential file
   - Unset credential helper
8. Delete GitHub auth record from database
9. Return success message
10. Always close SSH connection

**Error Handling**:
- Missing fields: 400 Bad Request
- VPS not found/unauthorized: 404 Not Found
- SSH errors: 500 Internal Server Error
- Always closes SSH connection

**Security Considerations**:
- Ownership verification implemented
- Credentials removed from VPS
- Database record deleted

**Database Operations**:
- Tables: `vpsMachines` (SELECT), `githubAuths` (DELETE)

**SSH Commands**: See [Command Deep-Dive](#command-deep-dive) section

---

#### `getGithubStatusController` - Get GitHub Status

**File**: `controllers/Github/getGithubStatusController.ts`  
**Function**: `getGithubStatusController({ params, set })`  
**Purpose**: Check GitHub authentication status  
**Parameters**:
- `params`: Route parameters (id - VPS ID)
- `set`: Response setter

**Return Value**: GitHub auth record or error

**Logic Flow**:
1. Validate VPS ID exists
2. Query database for GitHub auth record
3. If not found, return 404
4. Return auth record

**Error Handling**:
- Missing ID: Returns error (no status set)
- Not found: 404 Not Found
- Database errors: 500 Internal Server Error

**Security Considerations**:
- **ISSUE**: No ownership verification - any authenticated user can check any VPS's GitHub status

**Database Operations**:
- Table: `githubAuths`
- Operation: SELECT by vpsId

---

## Command Deep-Dive

### SSH Commands Executed

#### 1. Machine Analytics Commands (`viewDetails`)

##### Command: `free -m`
**Full Command**: `free -m`  
**Purpose**: Display memory usage information  
**Breakdown**:
- `free`: Command to display memory statistics
- `-m`: Flag to display output in megabytes (MB)

**Why This Command**: Provides RAM usage information (total, used, free, shared, buff/cache, available)

**Expected Output**:
```
              total        used        free      shared  buff/cache   available
Mem:           4096        1024        2048         128        1024        3072
Swap:          2048           0        2048
```

**Failure Scenarios**:
- Command not found (unlikely on Linux)
- Permission issues (unlikely as root)

---

##### Command: `df -h`
**Full Command**: `df -h`  
**Purpose**: Display disk space usage  
**Breakdown**:
- `df`: Disk filesystem command
- `-h`: Human-readable format (KB, MB, GB)

**Why This Command**: Shows storage usage for all mounted filesystems

**Expected Output**:
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        100G   20G   75G  21% /
```

**Failure Scenarios**:
- Filesystem errors
- Permission issues (unlikely as root)

---

##### Command: `cat /proc/cpuinfo | grep 'model name' | uniq`
**Full Command**: `cat /proc/cpuinfo | grep 'model name' | uniq`  
**Purpose**: Extract CPU model information  
**Breakdown**:
- `cat /proc/cpuinfo`: Read CPU information from proc filesystem
- `|`: Pipe output to next command
- `grep 'model name'`: Filter lines containing "model name"
- `| uniq`: Remove duplicate lines

**Why This Command**: Provides CPU model name (all cores have same model, so uniq removes duplicates)

**Expected Output**:
```
model name : Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz
```

**Failure Scenarios**:
- `/proc/cpuinfo` not accessible
- grep pattern not found (unlikely)

---

##### Command: `hostnamectl | grep 'Operating System'`
**Full Command**: `hostnamectl | grep 'Operating System'`  
**Purpose**: Extract operating system information  
**Breakdown**:
- `hostnamectl`: System hostname control command
- `|`: Pipe output
- `grep 'Operating System'`: Filter OS line

**Why This Command**: Provides OS name and version

**Expected Output**:
```
Operating System: Ubuntu 22.04.3 LTS
```

**Failure Scenarios**:
- `hostnamectl` not available (older systems)
- Pattern not found

---

##### Command: `top -b -n 1`
**Full Command**: `top -b -n 1`  
**Purpose**: Display process information  
**Breakdown**:
- `top`: Process monitor command
- `-b`: Batch mode (non-interactive)
- `-n 1`: Run once and exit (single iteration)

**Why This Command**: Provides snapshot of running processes and system load

**Expected Output**:
```
top - 10:00:00 up 10 days,  1:23,  1 user,  load average: 0.50, 0.75, 1.00
Tasks: 150 total,   1 running, 149 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.0 us,  2.0 sy,  0.0 ni, 93.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
...
```

**Failure Scenarios**:
- `top` command not installed
- Permission issues (unlikely as root)

---

#### 2. GitHub Authentication Commands (`authenticateGithubController`)

##### Command: `sudo apt install -y git curl`
**Full Command**: `sudo apt install -y git curl`  
**Purpose**: Install git and curl packages  
**Breakdown**:
- `sudo`: Execute as superuser
- `apt`: Advanced Package Tool (Debian/Ubuntu)
- `install`: Install packages
- `-y`: Automatic yes to prompts (non-interactive)
- `git`: Version control system
- `curl`: HTTP client tool

**Why This Command**: Ensures git and curl are available for GitHub operations

**Expected Output**:
```
Reading package lists... Done
Building dependency tree... Done
...
Setting up git (1:2.34.1-1ubuntu1.10) ...
Setting up curl (7.81.0-1ubuntu1.14) ...
```

**Failure Scenarios**:
- Package repository unavailable
- Insufficient disk space
- Network connectivity issues
- Already installed (exits with code 0)

---

##### Command: `curl -f -s -H "Authorization: token ${token}" https://api.github.com/users/${username} > /dev/null || (echo "Invalid GitHub username or token" && exit 1)`
**Full Command**: `curl -f -s -H "Authorization: token ${token}" https://api.github.com/users/${username} > /dev/null || (echo "Invalid GitHub username or token" && exit 1)`  
**Purpose**: Validate GitHub token and username  
**Breakdown**:
- `curl`: HTTP client
- `-f`: Fail silently on HTTP errors
- `-s`: Silent mode (no progress bar)
- `-H "Authorization: token ${token}"`: HTTP header with GitHub token
- `https://api.github.com/users/${username}`: GitHub API endpoint
- `> /dev/null`: Redirect output to null (discard)
- `||`: Logical OR (execute if curl fails)
- `(echo "..." && exit 1)`: Error message and exit with code 1

**Why This Command**: Verifies that the provided GitHub token is valid and matches the username before storing credentials

**Expected Output**:
- Success: No output (redirected to /dev/null), exit code 0
- Failure: Error message, exit code 1

**Failure Scenarios**:
- Invalid GitHub token
- Token doesn't match username
- Network connectivity issues
- GitHub API unavailable
- Username doesn't exist

**Security Considerations**:
- Token validated before storage
- Prevents storing invalid credentials

---

##### Command: `git config --global credential.helper store`
**Full Command**: `git config --global credential.helper store`  
**Purpose**: Configure git to use credential store  
**Breakdown**:
- `git config`: Git configuration command
- `--global`: Apply to all repositories for this user
- `credential.helper`: Set credential helper
- `store`: Use plaintext file storage

**Why This Command**: Enables git to automatically use stored credentials

**Expected Output**: None (command succeeds silently)

**Failure Scenarios**:
- Git not installed (handled by previous command)
- Permission issues (unlikely as root)
- Config file write failure

---

##### Command: `echo "https://${username}:${token}@github.com" > ~/.git-credentials`
**Full Command**: `echo "https://${username}:${token}@github.com" > ~/.git-credentials`  
**Purpose**: Store GitHub credentials in git credential file  
**Breakdown**:
- `echo`: Print text
- `"https://${username}:${token}@github.com"`: Credential URL format
- `>`: Redirect output to file (overwrite)
- `~/.git-credentials`: Git credential storage file

**Why This Command**: Stores credentials in format git expects

**Expected Output**: Creates/overwrites `~/.git-credentials` file

**Failure Scenarios**:
- File write permission denied
- Disk full
- Invalid characters in username/token

**Security Considerations**:
- Credentials stored in plaintext (next command secures file)

---

##### Command: `chmod 600 ~/.git-credentials`
**Full Command**: `chmod 600 ~/.git-credentials`  
**Purpose**: Secure credential file permissions  
**Breakdown**:
- `chmod`: Change file permissions
- `600`: Octal permission (rw-------)
  - Owner: read + write
  - Group: no access
  - Others: no access

**Why This Command**: Restricts access to credential file (only owner can read/write)

**Expected Output**: None (command succeeds silently)

**Failure Scenarios**:
- File doesn't exist (shouldn't happen after previous command)
- Permission denied (unlikely as root)

**Security Considerations**:
- Prevents other users from reading credentials
- Standard security practice for credential files

---

#### 3. GitHub Unauthentication Commands (`unauthenticateGithubController`)

##### Command: `sudo rm -f ~/.git-credentials || true`
**Full Command**: `sudo rm -f ~/.git-credentials || true`  
**Purpose**: Remove git credential file  
**Breakdown**:
- `sudo`: Execute as superuser
- `rm`: Remove file command
- `-f`: Force (no error if file doesn't exist)
- `~/.git-credentials`: Credential file path
- `|| true`: Always succeed (even if rm fails)

**Why This Command**: Removes stored GitHub credentials

**Expected Output**: None (file removed or doesn't exist)

**Failure Scenarios**:
- File already deleted (handled by `|| true`)
- Permission issues (unlikely with sudo)

---

##### Command: `git config --global --unset credential.helper || true`
**Full Command**: `git config --global --unset credential.helper || true`  
**Purpose**: Remove git credential helper configuration  
**Breakdown**:
- `git config`: Git configuration command
- `--global`: Apply globally
- `--unset credential.helper`: Remove credential.helper setting
- `|| true`: Always succeed (even if unset fails)

**Why This Command**: Removes credential helper configuration

**Expected Output**: None (setting removed or doesn't exist)

**Failure Scenarios**:
- Setting not configured (handled by `|| true`)
- Config file issues (handled by `|| true`)

---

## Security Analysis

### Authentication & Authorization

#### JWT Token Authentication
- **Implementation**: Cookie-based JWT tokens
- **Token Verification**: `verifyAccessToken` function
- **Secret**: Stored in `ACCESS_TOKEN_SECRET` environment variable
- **Token Extraction**: From `cookie.accessToken`
- **Expiration Handling**: Returns false for expired tokens (419 status)

**Security Strengths**:
- Tokens verified on every protected request
- Secret stored in environment variables
- Expired tokens properly rejected

**Security Weaknesses**:
- No token refresh mechanism
- No rate limiting on authentication endpoints
- Token stored in cookie (consider HttpOnly flag)

---

#### Authorization Checks

**Implemented Ownership Verification**:
- ✅ `deleteMachine`: Verifies `ownerId === userId`
- ✅ `authenticateGithubController`: Verifies VPS ownership
- ✅ `unauthenticateGithubController`: Verifies VPS ownership
- ✅ `deleteDomain`: Verifies domain ownership

**Missing Ownership Verification**:
- ❌ `updateMachine`: No ownership check
- ❌ `viewDetails`: No ownership check
- ❌ `getGithubStatusController`: No ownership check

**Recommendations**:
- Add ownership verification to all resource-accessing endpoints
- Consider implementing role-based access control (RBAC)

---

### Input Validation

**Current Validation**:
- Required field checks on most endpoints
- Type validation via TypeScript
- Parameter existence checks

**Missing Validation**:
- IP address format validation
- Domain name format validation
- Date format validation (relies on Date constructor)
- Password strength requirements
- SQL injection prevention (handled by Drizzle ORM)

**Recommendations**:
- Add IP address regex validation
- Add domain name validation (RFC 1123)
- Add date format validation
- Consider password strength requirements

---

### SQL Injection Prevention

**Implementation**: Drizzle ORM with parameterized queries  
**Method**: All queries use Drizzle's query builder  
**Example**:
```typescript
db.select().from(vpsMachines).where(eq(vpsMachines.id, vpsId))
```

**Security Status**: ✅ Protected  
**Reason**: Drizzle ORM automatically parameterizes queries, preventing SQL injection

---

### Password Security

**Encryption**:
- Algorithm: AES (configurable via `ENCRYPTION_ALGORITHM`)
- Key: Stored in `ENCRYPTION_KEY` environment variable
- Implementation: CryptoJS library

**Storage**:
- Passwords encrypted before database storage
- Decryption only when needed for SSH connections
- Decrypted passwords never logged

**Security Strengths**:
- Passwords never stored in plaintext
- Encryption key in environment variables
- Decryption only when necessary

**Security Weaknesses**:
- Encryption key must be strong
- No key rotation mechanism
- Consider using key derivation functions (PBKDF2)

---

### SSH Security

**Connection Security**:
- Uses SSH2 library (encrypted connection)
- Password-based authentication
- Root user access

**Command Execution**:
- Commands executed as root
- No command sanitization
- Output logged for debugging

**Security Concerns**:
- Root access provides full system control
- No command whitelist/blacklist
- Potential command injection if user input not sanitized

**Recommendations**:
- Consider SSH key-based authentication
- Implement command whitelist
- Sanitize all user inputs before command construction
- Consider using sudo with limited privileges

---

### CORS Configuration

**Current Configuration**:
```typescript
{
  origin: ["http://localhost:5173", "https://zyotraportal.ramkrishna.cloud"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

**Security Status**: ✅ Properly configured  
**Strengths**:
- Specific allowed origins (not wildcard)
- Credentials enabled for authenticated requests
- Specific HTTP methods allowed

**Recommendations**:
- Consider environment-based origin configuration
- Add rate limiting headers

---

### Error Handling & Information Disclosure

**Current Behavior**:
- Error messages include detailed error information
- Database errors exposed to client
- Stack traces potentially exposed

**Security Concerns**:
- Detailed errors may reveal system information
- Database errors may expose schema information

**Recommendations**:
- Sanitize error messages in production
- Log detailed errors server-side only
- Return generic error messages to clients

---

### Rate Limiting

**Current Status**: ❌ Not implemented  
**Recommendations**:
- Implement rate limiting middleware
- Limit authentication attempts
- Limit API requests per user/IP

---

## Data Flow

### Request Flow Diagram

```
Client Request
    │
    ▼
┌─────────────────┐
│   Elysia App    │
│   (index.ts)    │
└────────┬────────┘
         │
         ├──► CORS Check
         │    └──► Origin Validation
         │
         ├──► Route Matching
         │    └──► routes.ts
         │
         ├──► Authentication Check (if protected)
         │    └──► checkAuthPlugin
         │         ├──► Extract Token from Cookie
         │         ├──► verifyAccessToken()
         │         │    └──► jwt.verify()
         │         │         └──► Return userId
         │         └──► Attach userId to Context
         │
         └──► Route Handler (Controller)
              │
              ├──► Input Validation
              │    └──► Check Required Fields
              │
              ├──► Database Operations (if needed)
              │    └──► Drizzle ORM
              │         └──► PostgreSQL
              │
              ├──► Encryption/Decryption (if needed)
              │    ├──► encryptVpsPassword()
              │    └──► decryptVpsPassword()
              │
              ├──► SSH Operations (if needed)
              │    └──► SSHClient
              │         ├──► connect()
              │         ├──► exec() / runSequential()
              │         └──► close()
              │
              └──► Response Formation
                   └──► Return JSON Response
```

---

### Example: Add Machine Flow

1. **Client Request**:
   ```
   POST /add-machine
   Cookie: accessToken=<jwt_token>
   Body: { vpsIP, vpsName, vpsPassword, ... }
   ```

2. **CORS Check**: ✅ Origin allowed

3. **Route Matching**: ✅ Matches `/add-machine` POST route

4. **Authentication**:
   - Extract token from cookie
   - Verify token → Extract userId
   - Attach userId to context

5. **Controller Execution** (`addMachine`):
   - Validate userId exists
   - Validate required fields
   - Encrypt password: `encryptVpsPassword(vpsPassword)`
   - Encrypt SSH key (if provided)
   - Database INSERT: `db.insert(vpsMachines).values(...)`
   - Return created record

6. **Response**:
   ```json
   {
     "status": "success",
     "data": [/* machine record */]
   }
   ```

---

### Example: Authenticate GitHub Flow

1. **Client Request**:
   ```
   POST /authenticate-github/:id
   Cookie: accessToken=<jwt_token>
   Body: { githubUsername, githubToken }
   ```

2. **Authentication**: ✅ Token verified, userId extracted

3. **Controller Execution** (`authenticateGithubController`):
   - Validate required fields
   - Database SELECT: Get VPS with ownership check
   - Verify VPS exists and belongs to user
   - Decrypt password: `decryptVpsPassword(vps_password)`
   - Create SSHClient instance
   - SSH connect()
   - Execute commands sequentially:
     - Install git/curl
     - Validate GitHub token
     - Configure git credential helper
     - Store credentials
     - Secure credential file
   - Database INSERT: `db.insert(githubAuths).values(...)`
   - SSH close()
   - Return success

4. **Error Handling** (if any step fails):
   - Rollback: Remove credentials from VPS
   - Close SSH connection
   - Return error response

---

### Example: Get Machine Analytics Flow

1. **Client Request**:
   ```
   GET /get-machine-analytics/:id
   Cookie: accessToken=<jwt_token>
   ```

2. **Authentication**: ✅ Token verified

3. **Controller Execution** (`viewDetails`):
   - Extract machine ID from params
   - Database SELECT: Get machine by ID
   - Verify machine exists
   - Decrypt password
   - Create SSHClient
   - SSH connect()
   - Execute commands sequentially:
     - `free -m` → Memory info
     - `df -h` → Disk info
     - `cat /proc/cpuinfo | grep 'model name' | uniq` → CPU info
     - `hostnamectl | grep 'Operating System'` → OS info
     - `top -b -n 1` → Process info
   - Parse command outputs
   - SSH close()
   - Return analytics object

4. **Response**:
   ```json
   {
     "message": "Machine details fetched successfully",
     "data": {
       "memory": "...",
       "disk": "...",
       "cpu": "...",
       "os": "...",
       "processes": "..."
     }
   }
   ```

---

## Database Operations

### Table: `vpsMachines`

**Schema**:
```typescript
{
  id: serial (PK),
  vps_ip: varchar(100),
  vps_name: varchar(100),
  vps_password: text (encrypted),
  ownerId: integer,
  ssh_key: text (encrypted, nullable),
  ram: integer,
  storage: integer,
  cpu_cores: integer,
  expiryDate: timestamp,
  added_at: timestamp,
  updated_at: timestamp
}
```

**Operations**:
- **INSERT**: `addMachine` - Create new VPS record
- **SELECT**: `getMachines`, `viewDetails`, `authenticateGithubController`, `unauthenticateGithubController`, `updateMachine`, `deleteMachine`
- **UPDATE**: `updateMachine` - Update password or expiry date
- **DELETE**: `deleteMachine` - Remove VPS record

**Indexes**: Primary key on `id` (automatic)

**Relationships**: 
- `ownerId` references user (not enforced by FK)

---

### Table: `userDomains`

**Schema**:
```typescript
{
  id: serial (PK),
  domain_address: varchar(255),
  vps_ip: varchar(100),
  ownerId: integer,
  isDeployed: integer (default: 0),
  added_at: timestamp
}
```

**Operations**:
- **INSERT**: `addNewDomain` - Create new domain record
- **SELECT**: `getDomains`, `deleteDomain`
- **DELETE**: `deleteDomain` - Remove domain record

**Indexes**: Primary key on `id` (automatic)

**Relationships**:
- `ownerId` references user (not enforced by FK)
- `vps_ip` relates to `vpsMachines.vps_ip` (not enforced by FK)

---

### Table: `githubAuths`

**Schema**:
```typescript
{
  id: serial (PK),
  vpsId: integer,
  github_username: varchar(100),
  added_at: timestamp
}
```

**Operations**:
- **INSERT**: `authenticateGithubController` - Create GitHub auth record
- **SELECT**: `getGithubStatusController`
- **DELETE**: `unauthenticateGithubController` - Remove GitHub auth record

**Indexes**: Primary key on `id` (automatic)

**Relationships**:
- `vpsId` references `vpsMachines.id` (not enforced by FK)

---

### Query Patterns

**Common Patterns**:
1. **Select by Owner**: `WHERE ownerId = userId`
2. **Select by ID**: `WHERE id = ?`
3. **Select with Ownership**: `WHERE id = ? AND ownerId = userId`
4. **Dynamic Updates**: Build update object conditionally

**Performance Considerations**:
- Consider adding indexes on `ownerId` columns
- Consider adding index on `vpsId` in `githubAuths`
- Consider adding index on `vps_ip` in `userDomains`

---

## Error Handling

### Error Response Format

All errors follow this structure:
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "error": "Detailed error message (optional, in development)"
}
```

### Status Code Mapping

| Status Code | Enum Value | Usage |
|-------------|------------|-------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | CREATED | Successful POST |
| 400 | BAD_REQUEST | Missing/invalid request parameters |
| 401 | UNAUTHORIZED | Authentication/authorization failure |
| 403 | FORBIDDEN | Missing required fields, business rule violation |
| 404 | NOT_FOUND | Resource not found |
| 419 | EXPIRED_TOKEN | Invalid/missing JWT token |
| 500 | INTERNAL_SERVER_ERROR | Server/database/SSH errors |

### Error Handling Patterns

**Try-Catch Blocks**:
- All controllers use try-catch for error handling
- Database errors caught and returned as 500
- SSH errors caught and returned as 500
- Always close SSH connections in finally blocks

**Validation Errors**:
- Return 400/403 for missing/invalid input
- Return 401/404 for authorization/resource errors
- Return 500 for unexpected errors

**Rollback Mechanisms**:
- `authenticateGithubController`: Removes credentials on error
- SSH connections: Always closed in finally blocks

### Common Error Scenarios

1. **Missing Authentication Token**:
   - Status: 419
   - Message: "Access Token Missing"

2. **Invalid Token**:
   - Status: 419
   - Message: "Invalid Access Token"

3. **Resource Not Found**:
   - Status: 404
   - Message: "Machine/Domain not found"

4. **Unauthorized Access**:
   - Status: 401
   - Message: "Unauthorized to delete/access this resource"

5. **Missing Required Fields**:
   - Status: 400/403
   - Message: "Missing required fields"

6. **Database Errors**:
   - Status: 500
   - Message: "Failed to [operation]"
   - Error: Detailed error message

7. **SSH Connection Errors**:
   - Status: 500
   - Message: "Failed to [operation]"
   - Error: SSH error details

---

## Recommendations

### Security Improvements

1. **Add Ownership Verification**:
   - `updateMachine`: Verify `ownerId === userId`
   - `viewDetails`: Verify `ownerId === userId`
   - `getGithubStatusController`: Verify VPS ownership

2. **Input Validation**:
   - Add IP address format validation
   - Add domain name format validation
   - Add date format validation
   - Add password strength requirements

3. **Rate Limiting**:
   - Implement rate limiting middleware
   - Limit authentication attempts
   - Limit API requests per user/IP

4. **Error Message Sanitization**:
   - Sanitize error messages in production
   - Log detailed errors server-side only
   - Return generic error messages to clients

5. **SSH Security**:
   - Consider SSH key-based authentication
   - Implement command whitelist
   - Sanitize all user inputs before command construction

### Code Quality Improvements

1. **Type Safety**:
   - Remove `@ts-ignore` comments
   - Add proper type definitions for encryption algorithm

2. **Error Handling**:
   - Standardize error response format
   - Add error logging
   - Implement error codes

3. **Code Organization**:
   - Consider service layer separation
   - Extract common validation logic
   - Create utility functions for common operations

4. **Testing**:
   - Add unit tests for controllers
   - Add integration tests for routes
   - Add tests for SSH operations

5. **Documentation**:
   - Add JSDoc comments to functions
   - Document environment variables
   - Add API usage examples

---

## Conclusion

This Deployment Manager API provides a comprehensive solution for managing VPS machines, domains, and GitHub authentication. The codebase is well-structured with clear separation of concerns, but could benefit from additional security measures and input validation improvements.


