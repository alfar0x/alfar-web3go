# web3go by [alfar](https://t.me/+FozX3VZA0RIyNWY6)

**Note:** This script is still in development. Use it with caution!

## What the Script Does
1. Login
2. Get Passport
3. Open Gifts
4. Answer Questions
5. Check in Daily
6. See Gold Leaves Count

## How to Install
1. Download and install [Node.js](https://nodejs.org/en/download).
2. Install by typing `npm install` in the main folder.
3. Set up with `npm run initialize`.

## Setting Up
1. Fill in `input/config.ini`, `input/private-keys.txt`, and `input/proxies.txt`.

### Config
- rpc: BSC RPC url
- minutesToInitializeAll: Time to set up all wallets the first time
- isNewTaskAfterFinish: Choose if wallets run once or keep going
- isRandomProxy: Decide if it picks a random proxy or uses the wallet number

### Proxies
Each line is one proxy, with values separated by **;**
- type: Pick __http__ or __socks__
- host: IP address of the proxy server
- port: Port number for the proxy server
- username: Your username for the proxy
- password: Your password for the proxy
- changeUrl (optional for mobile proxy): Web link to change proxy settings

Example proxy: __http;11.1.1.1;8000;user;password__ or __http;11.1.1.1;8000;user;password;https://provider-url.com/change-proxy__ (mobile)

## How to Run
1. Type `npm run start` and press Enter.

## How to Update
1. Type `npm run update`.
2. If there are new settings, it keeps your old ones safe and creates new ones.
3. If there are new settings, fill in `input/config.ini`.

Discover more scripts on our [Telegram channel](https://t.me/+FozX3VZA0RIyNWY6).
