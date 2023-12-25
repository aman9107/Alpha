import type { Client } from "../../../client.mjs";

export default (client: Client, warning: string) => {
  console.log(`[client] :: warning :: [${client.util.time}]`);
  console.warn([warning]);
};
