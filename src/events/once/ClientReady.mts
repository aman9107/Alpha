import type { Client } from "../../client.mjs";

export default async (client: Client) => {
  client.application = await client.application.fetch();

  await client.application.commands.set(
    client.commands.slash.map((command) => command.data)
  );

  if (client.config.owners instanceof Set) {
    if ("username" in client.application.owner!)
      client.config.owners.add(client.application.owner.id);
    else
      client.application.owner!.members.forEach((member, id) => {
        client.config.owners.add(id);
      });
  }
};
