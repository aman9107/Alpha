import type { Client } from "../../../client.mjs";
import type { Snowflake } from "discord.js";

export default (client: Client, id: number, na: Set<Snowflake>) => {
  console.log(`[shard#${id}] :: connected :: [${client.util.time}]`);
  if (na instanceof Set) console.log(" unavailable Guild", na);
};
