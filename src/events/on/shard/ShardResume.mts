import type { Client } from "../../../client.mjs";

export default (client: Client, id: number, events: number) => {
  console.log(
    `[shar#${id}] :: reconnected(${events}) :: [${client.util.time}]`
  );
};
