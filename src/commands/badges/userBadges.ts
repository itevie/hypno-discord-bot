import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAllAquiredBadgesFor } from "../../util/actions/badges";
import { formatAquiredBadges } from "../../util/badges";

const command: HypnoCommand<{ user?: User }> = {
  name: "badges",
  description: "Get yours or another person's badges",
  type: "badges",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, args) => {
    let user = args.args.user ? args.args.user : message.author;
    let badges = formatAquiredBadges(await getAllAquiredBadgesFor(user.id));
    if (badges.length === 0)
      return message.reply(
        `${user.id === message.author.id ? "You" : "They"} have no badges :(`
      );
    return message.reply(
      `${
        user.id === message.author.id ? "Your" : "Their"
      } badges:\n\n${badges.join("\n")}`
    );
  },
};

export default command;