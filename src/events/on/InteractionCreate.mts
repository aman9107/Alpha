import type { Client } from "../../client.mjs";
import type { Interaction } from "discord.js";

export default async (client: Client, i: Interaction) => {
  for (const [type, interaction] of client.interactions) {
    if ((i as any)[type]?.()) {
      try {
        await interaction(client, i);
      } catch (err) {
        console.log(
          `[interaction] :: '${type.slice(2)}' Error :: [${client.util.time}]`
        );
        console.error([err.stack || err.message]);
      }
    }
  }
};
