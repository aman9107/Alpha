import type { Client, Subcommand, TextCommand } from "../../../client.mjs";
import Discord from "discord.js";

export default {
  name: "help",
  usage: "help [command | category]",
  description: "get help from the bot",
  subcommands: [
    {
      name: "ok",
    },
    {
      name: "alright",
    },
  ],
  permissions: {
    member: [Discord.PermissionFlagsBits.ManageGuild],
  },

  async execute(client: Client, message: Discord.Message, args: string[]) {
    const command_embed = (command: TextCommand | Subcommand) =>
      new Discord.EmbedBuilder()
        .setColor(Discord.Colors.White)
        .setTitle("Command </>")
        .addFields(
          [
            {
              name: "Name",
              value: Discord.codeBlock(command.name),
            },
            command.usage
              ? {
                  name: "Usage",
                  value: Discord.codeBlock(command.usage),
                }
              : null,
            command.aliases
              ? {
                  name: "Aliases",
                  value: Discord.codeBlock(command.aliases!.join(", ")),
                }
              : null,
            (command as TextCommand).category
              ? {
                  name: "Category",
                  value: Discord.codeBlock((command as TextCommand).category),
                }
              : null,
            {
              name: "Owner only",
              value: Discord.codeBlock(command.owner ? "Yes" : "No"),
            },
            command.description
              ? {
                  name: "Description",
                  value: Discord.codeBlock(command.description),
                }
              : null,
            command.permissions?.member
              ? {
                  name: "Required permissions",
                  value: Discord.codeBlock(
                    new Discord.PermissionsBitField()
                      .add(...command.permissions.member)
                      .toArray()
                      .join(", ")
                  ),
                }
              : null,
          ].filter(Boolean) as Discord.APIEmbedField[]
        );
    if (args.length > 0) {
      const query = args.shift()!;
      let result: TextCommand | undefined | string =
        client.commands.text.get(query);
      if (!result) {
        result = client.commands.text.reduce((total, command) => {
          if (command.category === query)
            total += `**${command.name}** | ${
              command.description?.slice(0, 20) || "No description"
            }\n`;
          return total;
        }, "");
        if (result.length === 0) {
          await message.reply({
            embeds: [
              client.errorEmbed.setDescription(
                Discord.codeBlock(
                  "No command or category is known by that name"
                )
              ),
            ],
          });
          return;
        }
        await message.reply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor(Discord.Colors.White)
              .setTitle(query)
              .setDescription(result),
          ],
        });
        return;
      }
      if (args.length === 0) {
        await message.reply({
          embeds: [command_embed(result)],
        });
        return;
      }
      if (!result.subcommands) {
        await message.reply({
          embeds: [
            client.errorEmbed.setDescription(
              Discord.codeBlock(`The '${query}' command has no subcommands`)
            ),
          ],
        });
        return;
      }
      const find_subcommand = (arg_list: string[]): undefined | Subcommand => {
        const arg = arg_list.shift();
        if (typeof arg !== "string") return;
        const subcommand = (result as TextCommand).subcommands!.find(
          (i) => i.name === arg
        );
        if (!subcommand) return;
        if (arg_list.length !== 0) return find_subcommand(arg_list);
        return subcommand;
      };
      const subcommand = find_subcommand(args.slice(0));
      if (!subcommand) {
        await message.reply({
          embeds: [
            client.errorEmbed.setDescription(
              Discord.codeBlock(
                "Failed to find a subcommand following the provided hierarchy"
              )
            ),
          ],
        });
        return;
      }
      await message.reply({
        embeds: [
          command_embed(subcommand)
            .setTitle("Subcommand </>")
            .setDescription(args.join(" > ")),
        ],
      });
      return;
    }
    const categories = client.commands.text.reduce(
      (total: Map<string, TextCommand[]>, command) => {
        if (total.has(command.category))
          total.get(command.category)!.push(command);
        else total.set(command.category, [command]);
        return total;
      },
      new Map()
    );
    const menu = new client.util.queue<TextCommand>([]);
    const command_nav = () =>
      new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId(`previousItem_${message.author.id}`)
          .setEmoji("⬅️")
          .setDisabled(!menu.previous),
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Secondary)
          .setCustomId(`currentItem_${message.author.id}`)
          .setLabel(menu.currentItem.name)
          .setDisabled(true),
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId(`nextItem_${message.author.id}`)
          .setEmoji("➡️")
          .setDisabled(!menu.next)
      );

    const category_nav = (def_cat?: string) =>
      new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>().addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId(`category_${message.author.id}`)
          .setOptions(
            [...categories.keys()].map((category) =>
              new Discord.StringSelectMenuOptionBuilder()
                .setLabel(category)
                .setValue(category)
                .setDefault(category === def_cat)
            )
          )
      );
    const msg = await message.reply({
      embeds: [
        client.introEmbed.setFooter({
          text: "You can browse commands faster category-wise",
          iconURL: message.author.displayAvatarURL(),
        }),
      ],
      components: [category_nav()],
    });
    const collector = msg.createMessageComponentCollector({
      filter: (req) => req.customId.includes(message.author.id),
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
        const command = (menu as any)[action] as TextCommand;
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
        await msg.edit({
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
