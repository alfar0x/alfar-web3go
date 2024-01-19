# Web3go by [alfar](https://t.me/+FozX3VZA0RIyNWY6)

# This script is currently under development. Use it at your own risk!

Script can:
1. Login
1. Mint passport
1. Open gifts
1. Answer questions
1. Do daily check in
1. Check gold leaves count

## Install
1. Download and install [Node.js](https://nodejs.org/en/download).
1. Install dependencies using the `npm install` command in the project root.
1. Initialize files and folders `npm run initialize`

## Setup
1. Fill `input/config.ini` and `input/private-keys.txt` files

### Global Configuration

- rpc - BSC RPC url
- minutesToInitializeAll - minutes to initialize all wallets on first iteration
- runOneTimeOnly - indicates if the each wallet should run only once (or create task to another day and so on)

### Proxy Configuration

- type - type of proxy __http__ or __socks__
- host - IP address of the proxy server
- port - port number for the proxy server
- username - username for proxy authentication
- password - password for proxy authentication
- changeUrl - URL for changing proxy IP settings

## Run
1. Run `npm run start`

## Update
1. Run `npm run update`.
1. If new config variables are available your current config will be backed up and new config will be created
1. Fill `input/config.ini` file if new variables available

Explore more scripts on our telegram channel:
[alfar](https://t.me/+FozX3VZA0RIyNWY6)
