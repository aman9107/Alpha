import Discord from "discord.js";
import * as config from "./util/config.mjs";
import * as helper from "./util/helper.mjs";
import { readdirSync, statSync } from "node:fs";

type Subcommand = Omit<TextCommand, "category" | "execute">;

type Permission = Discord.PermissionFlags[keyof Discord.PermissionFlags];

interface Permissions {
  client?: Permission[];
  member?: Permission[];
}

type Interaction = (
  client: Client,
  interaction: Discord.Interaction
) => Promise<void>;

interface SlashCommand {
  data: Discord.SlashCommandBuilder;
  owner?: boolean;
  category: string;
  autocomplete?: Interaction;
  execute: Interaction;
}

interface TextCommand {
  name: string;
  usage?: string;
  owner?: boolean;
  category: string;
  aliases?: string[];
  description?: string;
  permissions?: Permissions;
  subcommands?: Subcommand[];
  execute(
    client: Client,
    message: Discord.Message,
    args: string[]
  ): Promise<void>;
}

export type {
  Client,
  Interaction,
  Subcommand,
  Permission,
  Permissions,
  SlashCommand,
  TextCommand,
};

export default class Client extends Discord.Client<true> {
  util: typeof helper;
  config: Omit<typeof config, "token">;

  commands: {
    slash: Discord.Collection<string, SlashCommand>;
    text: Discord.Collection<string, TextCommand>;
    aliases: Map<string, string>;
  };
  interactions: Map<string, Interaction>;

  constructor(options: Discord.ClientOptions) {
    super(options);
    this.util = { ...helper };
    this.config = { ...config };

    this.commands = {
      slash: new Discord.Collection(),
      text: new Discord.Collection(),
      aliases: new Map(),
    };
    this.interactions = new Map();
  }

  get mention() {
    return this.user.toString();
  }

  get introEmbed() {
    return new Discord.EmbedBuilder()
      .setColor(Discord.Colors.White)
      .setAuthor({
        name: this.user.username,
        iconURL: this.user.displayAvatarURL(),
      })
      .setThumbnail(this.user.displayAvatarURL())
      .setDescription(
        Discord.codeBlock(
          `👋 Hello there, I'm ${this.user.username}\nA professional at your service 24/7`
        )
      );
  }

  get errorEmbed() {
    return new Discord.EmbedBuilder()
      .setColor(Discord.Colors.Red)
      .setAuthor({
        name: "Something went wrong",
        iconURL: this.user.displayAvatarURL(),
      })
      .setThumbnail(this.user.displayAvatarURL());
  }

  async start() {
    const setCommand = async (path: string, category: string) => {
      const cause = `File: ${path}`;
      const command = (await import(path)).default as
        | SlashCommand
        | TextCommand;
      if (!command) throw new Error("Command has no default export", { cause });
      if (!("execute" in command && typeof command.execute === "function"))
        throw new TypeError(
          "Command does not have a valid 'execute' function",
          { cause }
        );
      command.category = category;
      if (
        "data" in command &&
        command.data instanceof Discord.SlashCommandBuilder
      )
        this.commands.slash.set(command.data.name, command);
      else if ("name" in command) {
        if (typeof command.name !== "string")
          throw new TypeError("Command name is not a string", { cause });
        if (Array.isArray(command.aliases))
          for (const alias of command.aliases) {
            if (this.commands.aliases.has(alias))
              throw new Error(
                "Command conflicts with a different command having the same alias",
                {
                  cause: `${cause}\nCommands '${
                    command.name
                  }' & '${this.commands.aliases.get(
                    alias
                  )}' have the same alias '${alias}'`,
                }
              );
            this.commands.aliases.set(alias, command.name);
          }
        if (command.permissions || command.subcommands) {
          const check_perms = (perms: Permissions) => {
            if (
              (perms.client && !Array.isArray(perms.client)) ||
              (perms.member && !Array.isArray(perms.member))
            )
              throw new TypeError(
                "Please double check your command/subcommand to make sure 'client' or 'member' permission(s) is an array",
                { cause }
              );
            if (
              perms.client?.some(
                (perm) =>
                  typeof perm !==
                  typeof Discord.PermissionFlagsBits.Administrator
              ) ||
              perms.member?.some(
                (perm) =>
                  typeof perm !==
                  typeof Discord.PermissionFlagsBits.Administrator
              )
            )
              throw new TypeError(
                "Some permissions (either client or member) are not valid (i.e. not from Discord.PermissionFlagsBits)",
                { cause }
              );
          };
          if (command.permissions) check_perms(command.permissions);
          if (command.subcommands) {
            const check_subcommands = (subcommands: Subcommand[]) => {
              for (const subcommand of subcommands) {
                if (typeof subcommand.name !== "string")
                  throw new TypeError("Subcommand name is not a string", {
                    cause,
                  });
                if (subcommand.permissions) check_perms(subcommand.permissions);
                if (subcommand.subcommands)
                  check_subcommands(subcommand.subcommands);
              }
            };
            check_subcommands(command.subcommands);
          }
        }
        this.commands.text.set(command.name, command);
      } else throw new Error("Unsupported command type", { cause });
    };

    await (async function loadCommands(
      path = "./commands",
      category = "Miscellaneous"
    ) {
      const items = readdirSync(path);
      for (const item of items) {
        const dir = `${path}/${item}`;
        if (item.endsWith("js") && statSync(dir).isFile())
          await setCommand(dir, category);
        else await loadCommands(dir, item);
      }
    })();

    const setInteraction = async (path: string) => {
      const interaction = (await import(path)).default as Interaction;
      if (interaction.constructor.name !== "AsyncFunction")
        throw new TypeError(
          "Interactions must default export an asynchronous function",
          {
            cause: `File: ${path}`,
          }
        );
      this.interactions.set(path.split("/").pop()!.split(".")[0], interaction);
    };

    await (async function loadInteractions(path = "./interactions") {
      const items = readdirSync(path);
      for (const item of items) {
        const dir = `${path}/${item}`;
        if (item.endsWith("js") && statSync(dir).isFile())
          await setInteraction(dir);
        else await loadInteractions(dir);
      }
    })();

    const setEvent = async (path: string) => {
      const event = (await import(path)).default;
      if (typeof event !== "function")
        throw new TypeError("Events must default export a function", {
          cause: `File: ${path}`,
        });
      const type = path.match(/(?<=\/)(on|once)(?=\/)/)?.[0];
      if (!type)
        throw new Error("Failed to set client event", {
          cause:
            "Events folder shall only have folder(s) named 'on', 'once', or both containing the respective client events",
        });
      (this as any)[type](
        (Discord.Events as any)[path.split("/").pop()!.split(".")[0] as string],
        event.bind(null, this)
      );
    };

    await (async function loadEvents(path = "./events") {
      const items = readdirSync(path);
      for (const item of items) {
        const dir = `${path}/${item}`;
        if (item.endsWith("js") && statSync(dir).isFile()) await setEvent(dir);
        else await loadEvents(dir);
      }
    })();

    await this.login(config.token);
    delete (this.config as any).token;
  }
}
