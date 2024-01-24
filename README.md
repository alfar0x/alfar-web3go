# web3go by [alfar](https://t.me/+FozX3VZA0RIyNWY6)

**Note:** This script is still in development. Use it with on your own risk!

## What the Script Does
- login to your web3go account
- mint passport if needed
- open gifts if avaliable
- answer 6 quizes if they were not answered
- claim daily check in

you can also check real-time data into output/table.txt file
there will be next columns: address, updated at time, gold leaves count. Table will be updated for after each account run

## How to Install
1. Download and install [Node.js](https://nodejs.org/en/download).
1. Install command - `npm install`.
1. Set up command - `npm run initialize`.

## Setting Up
1. Fill in `input/config.ini`, `input/private-keys.txt`, and `input/proxies.txt`.

### Config
Dynamic scope values can be changed during program run

- rpc: BSC RPC url
- isRandomProxy: Decide if system picks a random proxy or uses the wallet number
- minutesToInitializeAll: Time to set up all wallets the first time
- isNewTaskAfterFinish: Choose if wallets run once or keep going

### Private keys
Each line is one private key, with values separated by **;**
- private key: you can use private key with __0x__ or without it
- name (optional): if you want to specify name you can add it

Example private key: __0xaaaaabbbbb__ or __0xaaaaabbbbb;wallet1__ or __aaaaabbbbb__

### Proxies
Each line is one proxy, with values separated by **;**
- type: Pick __http__ or __socks__
- host: IP address of the proxy server
- port: Port number for the proxy server
- username: Your username for the proxy
- password: Your password for the proxy
- changeUrl (optional for mobile proxy): Web link to change proxy settings

Example proxy: __http;11.1.1.1;8000;user;password__ or __socks;11.1.1.1;8000;user;password;https://provider-url.com/change-proxy__ (mobile)

## Collect all mode
1. Type `npm run collect-all` and press Enter.

## How to Update
1. Type `npm run update`.
1. If there are new settings, system will create backup file of previous config and create new one `input/config.ini` file.

Discover more scripts on our [Telegram channel](https://t.me/+FozX3VZA0RIyNWY6).
