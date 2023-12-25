import Discord from "discord.js";
export default async (client, message) => {
    (async () => {
        if (message.author.bot || message.content !== client.mention)
            return;
        try {
            await message.reply({
                embeds: [client.introEmbed],
            });
        }
        catch { }
    })();
    (async () => {
        if (message.author.bot ||
            (!message.content.startsWith(client.mention) &&
                !message.content.startsWith(client.config.prefix)))
            return;
        const args = message.content.split(/ +/g);
        const arg = args
            .shift()
            .slice(message.content.startsWith(client.mention)
            ? client.mention.length
            : client.config.prefix.length)
            .trim();
        const command = client.commands.text.get(client.commands.aliases.has(arg) ? client.commands.aliases.get(arg) : arg);
        if (!command)
            return;
        if (command.owner && !client.config.owners.has(message.author.id))
            try {
                await message.reply({
                    content: "This command has been restricted to owners by the developer",
                });
            }
            catch {
            }
            finally {
                return;
            }
        if (command.permissions || command.subcommands) {
            const missing = async (note, perms) => {
                try {
                    await message.reply({
                        embeds: [
                            client.errorEmbed.setDescription(`${note}\n${Discord.codeBlock(perms)}`),
                        ],
                    });
                }
                catch { }
            };
            const permissions = {
                client: await (async () => {
                    const guild_perms = (await message.guild.members.fetch(client.user.id)).permissions;
                    const channel_perms = message.channel.permissionsFor(client.user.id);
                    return channel_perms ? guild_perms.add(channel_perms) : guild_perms;
                })(),
                member: await (async () => {
                    const guild_perms = (await message.guild.members.fetch(message.author.id)).permissions;
                    const channel_perms = message.channel.permissionsFor(message.author.id);
                    return channel_perms ? guild_perms.add(channel_perms) : guild_perms;
                })(),
            };
            const check_perms = async (perms) => {
                if (perms.client) {
                    const missing_perms = permissions.client.missing(perms.client);
                    if (missing_perms.length) {
                        await missing("I don't have the following permissions:", missing_perms.join(", "));
                        return false;
                    }
                }
                if (perms.member) {
                    const missing_perms = permissions.member.missing(perms.member);
                    if (missing_perms.length) {
                        await missing("You don't have the following permissions:", missing_perms.join(", "));
                        return false;
                    }
                }
                return true;
            };
            if (command.permissions && !(await check_perms(command.permissions)))
                return;
            if (command.subcommands) {
                const check_subcommands = async (subcommands, arg_list) => {
                    const argument = arg_list.shift();
                    if (!argument)
                        return;
                    const subcommand = subcommands.find((i) => i.name === argument);
                    if (!subcommand)
                        return;
                    if (subcommand.permissions &&
                        !(await check_perms(subcommand.permissions)))
                        throw new Error();
                    if (subcommand.subcommands)
                        return await check_subcommands(subcommand.subcommands, arg_list);
                };
                try {
                    await check_subcommands(command.subcommands, args.slice(0));
                }
                catch {
                    return;
                }
            }
        }
        try {
            await command.execute(client, message, args);
        }
        catch (err) {
            console.log(`[command] :: '${command.name}' error :: [${client.util.time}]`);
            console.error([err.stack || err.message]);
        }
    })();
};
