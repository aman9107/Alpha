import type { Client } from "../../../client.mjs";

export default (client: Client, err: Error, id: number) => {
  console.log(`[shard#${id}] :: errored :: [${client.util.time}]`);
  console.error([err.stack || err.message]);
};
