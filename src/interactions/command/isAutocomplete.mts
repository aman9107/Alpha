import type { Client } from "../../client.mjs";
import type { AutocompleteInteraction } from "discord.js";

export default async (client: Client, i: AutocompleteInteraction) => {
  const command = client.commands.slash.get(i.commandName)!;
  if (command.owner && !client.config.owners.has(i.user.id)) return;
  await command.autocomplete?.(client, i);
};
