export default async (client, i) => {
    const command = client.commands.slash.get(i.commandName);
    if (command.owner && !client.config.owners.has(i.user.id))
        return;
    await command.autocomplete?.(client, i);
};
