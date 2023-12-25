import type { Client } from "../../../client.mjs";
import type { CloseEvent } from "discord.js";

export default (client: Client, event: CloseEvent, id: number) => {
  console.log(`[shard#${id}] :: disconnected :: [${client.util.time}]`);
  console.info([event]);
};
