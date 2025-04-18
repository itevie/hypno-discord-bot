import {
  EmbedField,
  MessageCreateOptions,
  PermissionFlagsBits,
} from "discord.js";
import { commands } from "../..";
import { HypnoCommand } from "../../types/util";
import getAllFiles, { createEmbed } from "../../util/other";
import config from "../../config";
import { paginate } from "../../util/components/pagination";
import { categoryEmojis } from "./_util";
import megaAliases from "../../megaAliases";

const messageFiles = getAllFiles(__dirname + "/../../topics");
export const messages: { [key: string]: MessageCreateOptions } = {};
for (const messageFile of messageFiles) {
  const name = messageFile.match(/[a-z\-_]+\.[tj]s/)[0].replace(/\.[tj]s/, "");
  const messageImport = require(messageFile).default as MessageCreateOptions;
  messages[name] = messageImport;
}

const command: HypnoCommand<{ ignoreGuards: boolean }> = {
  name: "help",
  aliases: ["h", "commands", "cmds"],
  type: "help",
  description: `Get help on how to use the bot`,

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "ignoreGuards",
        type: "boolean",
        description: `Whether or not to forcefully show admin commands`,
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { serverSettings, args }) => {
    const categories: { [key: string]: string[] } = {};

    for (const i in commands) {
      const cat = commands[i].type ?? "uncategorised";
      let cmd = commands[i];

      const add = () => {
        if (!categories[cat]) categories[cat] = [];
        if (!categories[cat].includes(cmd.name)) {
          categories[cat].push(cmd.name);
        }
      };

      // Check guards
      if (args.ignoreGuards)
        if (args.ignoreGuards) {
          add();
          continue;
        }
      if (cmd.guards) {
        if (
          cmd.guards.includes("bot-owner") &&
          message.author.id !== config.owner
        )
          continue;
        if (
          cmd.guards.includes("bot-server") &&
          message.guild.id !== config.botServer.id
        )
          continue;
        if (
          cmd.guards.includes("admin") &&
          !message.member.permissions.has(PermissionFlagsBits.Administrator)
        )
          continue;
      }
      add();
    }

    let fields: EmbedField[] = [];

    for (const cat in categories) {
      if (cat === "actions") {
        fields.push({
          name: `${categoryEmojis[cat] || ""} Actions`,
          value: `See \`${serverSettings.prefix}action\` to view the actions you can do!`,
          inline: true,
        });
      } else {
        fields.push({
          name: `${categoryEmojis[cat] || ""} ${cat}`,
          value: categories[cat].map((x) => `\`${x}\``).join(", "),
          inline: true,
        });
      }
    }

    fields.push({
      name: "Mega Aliases",
      value: `The following are commands that contain commands and arguments:\n${Object.entries(
        megaAliases,
      )
        .map((x) => `\`${x[0]}\``)
        .join(", ")}`,
      inline: true,
    });

    fields.push({
      name: "Topics",
      value:
        `Below are the list of topics you can read about, use \`${serverSettings.prefix}topic <topic>\` to learn more about it!\n\n` +
        Object.keys(messages)
          .filter((x) => x.startsWith("help-"))
          .map((x) => x.replace("help-", ""))
          .join(", "),
      inline: true,
    });

    return paginate({
      message: message,
      embed: createEmbed()
        .setTitle("Help")
        .setDescription(
          `Hello! I'm Trancer, I'm a bot based around hypnosis, but I have plenty of other features too!\n` +
            `*Use \`${serverSettings.prefix}command <commandname>\` to get details on a command*`,
        ),
      type: "field",
      data: fields,
    });
  },
};

export default command;
