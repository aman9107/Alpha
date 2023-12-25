import type { Client } from "../../../client.mjs";

export default (client: Client, id: number) => {
  console.log(`[shard#${id}] :: reconnecting :: [${client.util.time}]`);
};
