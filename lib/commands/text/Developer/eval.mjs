import Discord from "discord.js";
export default {
    name: "eval",
    owner: true,
    description: "evaluates a script",
    async execute(client, message, args) {
        if (args.length === 0) {
            await message.reply({
                embeds: [
                    client.errorEmbed.setDescription(Discord.codeBlock("No script provided for evaluation")),
                ],
            });
            return;
        }
        const script = args.join(" ").match(/(?<=```\w*\n)(.+)(?=\n*```)/g)?.[0] ||
            args.join(" ");
        try {
            let result = eval(script);
            result = await client.util.format(result);
            if (result.length > 4086)
                result = result.match(/.{0,4086}/gs);
            const code_embed = (content) => new Discord.EmbedBuilder()
                .setColor(Discord.Colors.DarkButNotBlack)
                .setDescription(Discord.codeBlock("js", content));
            if (typeof result === "string") {
                await message.reply({
                    embeds: [code_embed(result)],
                });
                return;
            }
            const menu = new client.util.queue(result);
            const code_nav = () => new Discord.ActionRowBuilder().setComponents(new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId("firstItem")
                .setEmoji("⏮️")
                .setDisabled(!menu.previous), new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId("previousItem")
                .setEmoji("⏪")
                .setDisabled(!menu.previous), new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId("nextItem")
                .setEmoji("⏩")
                .setDisabled(!menu.next), new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId("lastItem")
                .setEmoji("⏭️")
                .setDisabled(!menu.next), new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`delete_${message.author.id}`)
                .setEmoji("🗑️"));
            const msg = await message.reply({
                embeds: [code_embed(menu.currentItem)],
                components: [code_nav()],
            });
            const collector = message.createMessageComponentCollector({
                idle: client.util.time.ms("3:00"),
            });
            collector.on("collect", async (interaction) => {
                if (interaction.customId.startsWith("delete")) {
                    collector.stop();
                    return;
                }
                menu[interaction.customId];
                await interaction.update({
                    embeds: [code_embed(menu.currentItem)],
                    components: [code_nav()],
                });
            });
            collector.on("end", async () => {
                menu.destroy();
                try {
                    await msg.delete();
                }
                catch { }
            });
        }
        catch (err) {
            await message.reply({
                embeds: [
                    client.errorEmbed.setDescription(Discord.codeBlock(err.message)),
                ],
            });
        }
    },
};
