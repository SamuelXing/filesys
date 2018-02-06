SDFS (Secure Distributed File Systems )
=====
A security protocol for secure distributed file systems (SDFS). Using OpenSSL to secure communication between client and server. Supporting the feature of logging to the blockchain.

## Env
**JavaScript**
```
NodeJS v9.4.0
```

**BlockChain**
```
Truffle v4.0.4
Ganache CLI v6.0.3
```

## Run
```bash
git clone https://github.com/SamuelXing/filesys.git
# Blockchain
ganache-cli -l 10000000000000
# Server
cd server && npm install
truffle compile	# compile contract
truffle migrate	# migrate contract to bck
# Currently only support manually copy the account_address and contract_address to server.js
node server.js
# Client
node client.js
```

## Descriptions of important files/dirs
```
Server ----- server.js    # main entry for server
              |--- keystore    # keep the server's certificate
              |--- db.dat    # data file: keep the username, hashed password, and FILE PERMISSION
              |--- filestore    # keep the accessible files
              .
              .
Client ----- client.js           # main entry for client
```

## Design

1, **Authentication**

I used ```tls``` module to implement the secure communication. The ```tls``` module provides an implementation of the Transport Layer Security (TLS) and Secure Socket Layer (SSL) protocols that is built on top of OpenSSL. 

**client**
At the first place, server sent its certificate to the client, client verify it with CA's public key. The session will stop if verification is not passed.

**server**
The server verifies client via its username and password which is pre-stored in the file ```db.dat```. The password is plain text when the server received it, the server will hash the password and compare it with the DB record. 

2, **Remote File Access Control (Currently Implemented )**

**Access_File(username, filename)**. Accessing a file will require a user has the permission on this file, if not, error message will be sent back from the server. The successful execution will return the contents of the required file.

**Set_File_Permission(username, filename)**. Setting a user's permission on a file.

**Delegate_File(delegator, delegatee, filename)**. Delegating a file's permission to delegatee, then the delegatee has the permission to access the file.
 
3, **Blockchain logging**

Each success access will be logging to the blockchain. There will be a smart contract deployed on blockchain to keep the logging info. The code snippet below demonstrate the data structure that holds the logging info.

```solidity
struct Record
{
    bytes32 timestamp_;
    bytes32 username_;
    bytes32 content_;
}
 
Record[] log;
```

## License
```
Copyright (C) 2016 Bilibili. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
