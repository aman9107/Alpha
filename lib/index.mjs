import Client from "./client.mjs";
import Discord from "discord.js";
const client = new Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
    ],
    presence: {
        activities: [
            {
                name: `v${Discord.version}`,
                type: Discord.ActivityType.Streaming,
                url: "https://twitch.tv/#",
            },
        ],
    },
});
await client.start();
