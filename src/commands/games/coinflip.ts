import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { currency } from "../../util/language";
import wrapGame from "./_util";

export const existingGames: { [key: string]: string } = {};

const command: HypnoCommand<{ user: User; amount: number }> = {
  name: "coinflip",
  aliases: ["cf"],
  description: "Coinflip with another user",
  type: "games",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "amount",
        type: "currency",
      },
    ],
  },

  handler: async (message, { args }) => {
    wrapGame({
      message,
      bet: args.amount,
      opponent: args.user,
      title: `Coinflip`,
      async callback(op) {
        await op.message.edit({
          components: [],
          embeds: [
            createEmbed()
              .setTitle("Coinflip")
              .setDescription(
                `Flipping the coin between **${message.author.username}** and **${args.user.username}**...`
              ),
          ],
        });

        const winner = Math.random() > 0.5 ? message.author : args.user;

        setTimeout(async () => {
          await op.message.edit({
            embeds: [
              createEmbed()
                .setTitle("Coinflip")
                .setDescription(
                  `**${winner.username}** won the coinflip for ${currency(
                    args.amount
                  )}!`
                ),
            ],
          });
          op.removePlayers(winner.id === message.author.id ? "p" : "o");
        }, 1000);
      },
    });
  },
};
export default command;
