import type { Client } from "../../../client.mjs";

export default (client: Client, err: Error) => {
  console.log(`[client] :: error :: [${client.util.time}]`);
  console.error([err.stack || err.message]);
};
