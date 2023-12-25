import type { Client } from "../../../client.mjs";
import Discord from "discord.js";

export default {
  owner: true,
  data: new Discord.SlashCommandBuilder()
    .setName("eval")
    .setDescription("evaluate a script")
    .addStringOption((script) =>
      script.setName("script").setDescription("script to evaluate")
    ),

  async execute(client: Client, i: Discord.ChatInputCommandInteraction) {
    await i.deferReply({ ephemeral: true });
    const script = i.options.getString("script") as string;
    try {
      let result: string | string[] = eval(script);
      result = await client.util.format(result);
      if (result.length > 4086)
        result = result.match(/.{0,4086}/gs) as string[];
      const code_embed = (content: string) =>
        new Discord.EmbedBuilder()
          .setColor(Discord.Colors.DarkButNotBlack)
          .setDescription(Discord.codeBlock("js", content));
      if (typeof result === "string") {
        await i.editReply({
          embeds: [code_embed(result)],
        });
        return;
      }
      const menu = new client.util.queue(result);
      const code_nav = () =>
        new Discord.ActionRowBuilder<Discord.ButtonBuilder>().setComponents(
          new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("firstItem")
            .setEmoji("⏮️")
            .setDisabled(!menu.previous),
          new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("previousItem")
            .setEmoji("⏪")
            .setDisabled(!menu.previous),
          new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("nextItem")
            .setEmoji("⏩")
            .setDisabled(!menu.next),
          new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("lastItem")
            .setEmoji("⏭️")
            .setDisabled(!menu.next)
        );
      const message = await i.editReply({
        embeds: [code_embed(menu.currentItem)],
        components: [code_nav()],
      });
      const collector = message.createMessageComponentCollector({
        idle: client.util.time.ms("3:00"),
      });
      collector.on("collect", async (interaction) => {
        (menu as any)[interaction.customId];
        await interaction.update({
          embeds: [code_embed(menu.currentItem)],
          components: [code_nav()],
        });
      });
      collector.on("end", async () => {
        menu.destroy();
        try {
          await i.deleteReply();
        } catch {}
      });
    } catch (err) {
      await i.editReply({
        embeds: [
          client.errorEmbed.setDescription(
            Discord.codeBlock(err.stack?.length < 4e3 ? err.stack : err.message)
          ),
        ],
      });
    }
  },
};
