# SydneyBot

Check out the [Wiki](https://github.com/TimmyRB/SydneyBot/wiki) for Quickstart & Installation instructions

## Getting Setup

### Notice

It is recommended to not run commands you're not developing as they may be server specific and could crash your bot when testing outside of the Sheridan SDNE Discord.

### NodeJS & NPM

I recommend NodeJS [v14.15.4](https://nodejs.org/dist/v14.15.4/) but any version after that from the [NodeJS Website](https://nodejs.org/) will work as well. Make sure to restart and command prompts you have open so that you can use node & npm from the command line.

You can check which NodeJS & npm version you have installed by running
```cmd
node --version && npm --version
```

### Git & Project Setup

1. Download and install [git](https://git-scm.com/downloads) onto your system
1. Open a command prompt and navigate to your desired directory
1. Run `git clone https://github.com/TimmyRB/SydneyBot.git && cd SydneyBot`
1. Next, run `npm i` in the new directory to download all required packages
1. Copy `example.env` to `.env` by running `copy example.env .env`

### Discord Application

1. Create a new Application on the [Discord Developer Portal](https://discord.com/developers/applications)
1. Under where it says `Client ID`, click the `Copy` button
1. On the left-hand side, click `Bot` and then `Add Bot`
    1. While not necessary, I recommend turning off the `Public Bot` option
1. Make sure to turn on the `Presence Intent` and `Server Members Intent` options
1. Open a new tab with this link and replace `YOUR_CLIENT_ID` with the Client ID you copied a few steps ago
    1. `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot`
1. Once the bot is added to your server, go back to the Discord Developer Portal and copy your bot token
1. Got into the `.env` we created and paste the bot token next to `BOT_TOKEN=`
1. In Discord, open your User settings, go to `Appearance` then turn on `Developer Mode` & close your Settings
1. Right-click the server you added your bot to into the server list, and click `Copy ID`
1. Paste the ID you just copied into your `.env` next to `BOT_GUILD=`

### CockroachDB

1. Create an Account or Login on [CockroachCloud](https://cockroachlabs.cloud/clusters)
1. Click `Create Cluster` and choose the Free Tier
1. Once the `Connection info` popup appears, download your `cc-ca.crt` and save it to `SydneyBot/certs/cc-ca.crt`
1. Next, copy the information under the `Your tool` tab and put it into your `.env`
```env
DB_HOST=host
DB_PORT=port
DB_DATABASE=database
DB_USERNAME=username
DB_PASSWORD=password
```

Congrats! You're now ready to start developing! You can run the bot by running `npm run start` in your command line.

### Additional Tools

If you're looking for a way to manage your cluster and verify that everything is writing to the Database correctly, I recommend using [Beekeeper Studio](https://www.beekeeperstudio.io/).

For Visual Studio Code users, I recommend using the following Extensions for ease of developing
* [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv)
* [JavaScript File Header](https://marketplace.visualstudio.com/items?itemName=arjunkomath.js-file-header)
* [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
