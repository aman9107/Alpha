import type { Client } from "../client.mjs";
import type { ChatInputCommandInteraction } from "discord.js";

export default async (client: Client, i: ChatInputCommandInteraction) => {
  const command = client.commands.slash.get(i.commandName)!;
  if (command.owner && !client.config.owners.has(i.user.id)) {
    await i.reply({
      content: "This command has been restricted to owners by the developer",
      ephemeral: true,
    });
    return;
  }
  await command.execute(client, i);
};
