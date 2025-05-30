import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createMessageRefEmbed, sendProxyMessage } from "../../util/proxy";

const censorLetter = "█";

const command: HypnoCommand<{
  words: string[];
  numbers?: number[];
  all?: boolean;
  opposite?: boolean;
}> = {
  name: "censor",
  type: "fun",
  description: "Resends a message with censored words".replace(
    /[^ ]/g,
    censorLetter,
  ),
  permissions: ["ManageMessages"],

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "words",
        type: "array",
        inner: "string",
      },
      {
        name: "numbers",
        type: "array",
        inner: "wholepositivenumber",
        aliases: ["ns", "n"],
        wickStyle: true,
      },
      {
        name: "all",
        type: "boolean",
        wickStyle: true,
        aliases: ["a"],
      },
      {
        name: "opposite",
        type: "boolean",
        wickStyle: true,
        aliases: ["o"],
      },
    ],
  },

  handler: async (message, { args }) => {
    if (!message.reference) return message.reply(`Please reply to a message`);
    let msg = await message.fetchReference();

    if (args.words && args.opposite)
      msg.content = maskExceptSubstrings(msg.content, args.words);
    else if (args.words)
      for (const a of args.words) {
        const instance = msg.content.match(
          new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
        );
        for (const i of instance || [])
          msg.content = msg.content.replace(i, censorLetter.repeat(i.length));
      }

    if (args.numbers)
      msg.content = msg.content
        .split(" ")
        .map(
          args.opposite
            ? (x, i) =>
                args.numbers.includes(+i + 1)
                  ? x
                  : censorLetter.repeat(x.length)
            : (x, i) =>
                args.numbers.includes(+i + 1)
                  ? censorLetter.repeat(x.length)
                  : x,
        )
        .join(" ");

    if (args.all)
      msg.content = msg.content
        .split(" ")
        .map((x) => censorLetter.repeat(x.length))
        .join(" ");

    await msg.delete();
    await message.delete();
    await sendProxyMessage(msg.channel as TextChannel, {
      content:
        msg.content +
        `\n-# <t:${Math.floor(msg.createdAt.getTime() / 1000)}:T>`,
      username:
        msg.member.displayName || msg.author.displayName || msg.author.username,
      avatarURL: msg.author.displayAvatarURL(),
      files: msg.attachments.map((x) => x.proxyURL),
      embeds: msg.reference
        ? [createMessageRefEmbed(await msg.fetchReference())]
        : [],
    });
  },
};

export default command;

function maskExceptSubstrings(
  input: string,
  keeps: string[],
  char = censorLetter,
): string {
  const escapedKeeps = keeps.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = escapedKeeps.join("|");
  const regex = new RegExp(pattern, "gi"); // global & case-insensitive

  return input
    .split(" ")
    .map((word) => {
      const mask = Array(word.length).fill(char);

      for (const match of word.matchAll(regex)) {
        const start = match.index!;
        const end = start + match[0].length;
        for (let i = start; i < end; i++) {
          mask[i] = word[i];
        }
      }

      return mask.join("");
    })
    .join(" ");
}
