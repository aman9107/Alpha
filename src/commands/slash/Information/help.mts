import Discord from "discord.js";
import type { Client, SlashCommand } from "../../../client.mjs";

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("help")
    .setDescription("get help from the bot")
    .addStringOption((category) =>
      category
        .setName("category")
        .setDescription("available categories")
        .setAutocomplete(true)
    )
    .addStringOption((command) =>
      command
        .setName("command")
        .setDescription("available commands")
        .setAutocomplete(true)
    ),

  async execute(client: Client, i: Discord.ChatInputCommandInteraction) {
    const options = {
      category: i.options.getString("category"),
      command: i.options.getString("command"),
    };

    if (typeof options.category === "string") {
      await i.reply({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(Discord.Colors.White)
            .setTitle(options.category)
            .setDescription(
              client.commands.slash
                .reduce((total, command) => {
                  if (command.category === options.category)
                    total += `**${
                      command.data.name
                    }** | ${command.data.description.slice(0, 20)}\n`;
                  return total;
                }, "")
                .slice(0, 4e3)
            )
            .setFooter({
              text: "This is a short preview; for full navigation, run the help command without any query",
              iconURL: i.user.displayAvatarURL(),
            }),
        ],
      });
      return;
    }

    const command_embed = (command: SlashCommand) =>
      new Discord.EmbedBuilder()
        .setColor(Discord.Colors.White)
        .setTitle("Command </>")
        .addFields([
          {
            name: "Name",
            value: Discord.codeBlock(command.data.name),
          },
          {
            name: "NSFW",
            value: Discord.codeBlock(command.data.nsfw ? "Yes" : "No"),
          },
          {
            name: "Category",
            value: Discord.codeBlock(command.category),
          },
          {
            name: "Owner only",
            value: Discord.codeBlock(command.owner ? "Yes" : "No"),
          },
          {
            name: "Description",
            value: Discord.codeBlock(command.data.description),
          },
          {
            name: "Allowed in DM",
            value: Discord.codeBlock(command.data.dm_permission ? "Yes" : "No"),
          },
        ]);

    if (typeof options.command === "string") {
      await i.reply({
        embeds: [command_embed(client.commands.slash.get(options.command)!)],
      });
      return;
    }

    const categories = client.commands.slash.reduce(
      (total: Map<string, SlashCommand[]>, command) => {
        if (total.has(command.category))
          total.get(command.category)!.push(command);
        else total.set(command.category, [command]);
        return total;
      },
      new Map()
    );

    const menu = new client.util.queue<SlashCommand>([]);

    const command_nav = () =>
      new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId(`previousItem_${i.user.id}`)
          .setEmoji("⬅️")
          .setDisabled(!menu.previous),
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Secondary)
          .setCustomId(`currentItem_${i.user.id}`)
          .setLabel(menu.currentItem.data.name)
          .setDisabled(true),
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId(`nextItem_${i.user.id}`)
          .setEmoji("➡️")
          .setDisabled(!menu.next)
      );

    const category_nav = (def_cat?: string) =>
      new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>().addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId(`category_${i.user.id}`)
          .setOptions(
            [...categories.keys()].map((category) =>
              new Discord.StringSelectMenuOptionBuilder()
                .setLabel(category)
                .setValue(category)
                .setDefault(category === def_cat)
            )
          )
      );

    const message = await i.reply({
      embeds: [
        client.introEmbed.setFooter({
          text: "You can browse commands faster category-wise",
          iconURL: i.user.displayAvatarURL(),
        }),
      ],
      components: [category_nav()],
    });

    const collector = message.createMessageComponentCollector({
      filter: (req) => req.customId.includes(i.user.id),
      idle: client.util.time.ms("2:00"),
    });

    collector.on("collect", async (interaction) => {
      if (interaction.isStringSelectMenu()) {
        const category = interaction.values[0];
        menu.items = categories.get(category)!;
        menu.index = 0;
        await interaction.update({
          embeds: [command_embed(menu.currentItem)],
          components: [command_nav(), category_nav(category)],
        });
        return;
      }
      if (interaction.isButton()) {
        const action = interaction.customId.split("_")[0];
        const command = (menu as any)[action] as SlashCommand;
        await interaction.update({
          embeds: [command_embed(command)],
          components: [command_nav(), category_nav(command.category)],
        });
        return;
      }
    });

    collector.on("end", async () => {
      menu.destroy();
      try {
        await message.edit({
          content: "",
          embeds: [
            new Discord.EmbedBuilder()
              .setColor(Discord.Colors.Red)
              .setTitle("Interaction timed out"),
          ],
          components: [],
        });
      } catch {}
    });
  },
};
