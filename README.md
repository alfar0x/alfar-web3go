# web3go by [alfar](https://t.me/+FozX3VZA0RIyNWY6)

**Note:** This script is still in development. Use it with on your own risk!

## What the Script Does
1. Login
1. Get Passport
1. Open Gifts
1. Answer Questions
1. Check in Daily
1. See Gold Leaves Count

## How to Install
1. Download and install [Node.js](https://nodejs.org/en/download).
1. Install command - `npm install`.
1. Set up command - `npm run initialize`.

## Setting Up
1. Fill in `input/config.ini`, `input/private-keys.txt`, and `input/proxies.txt`.

### Config
- rpc: BSC RPC url
- minutesToInitializeAll: Time to set up all wallets the first time
- isNewTaskAfterFinish: Choose if wallets run once or keep going
- isRandomProxy: Decide if system picks a random proxy or uses the wallet number

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

## How to Run
1. Type `npm run start` and press Enter.

## How to Update
1. Type `npm run update`.
1. If there are new settings, it keeps your old ones safe and creates new ones.
1. If there are new settings, fill in `input/config.ini`.

Discover more scripts on our [Telegram channel](https://t.me/+FozX3VZA0RIyNWY6).
