import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ name: string }> = {
  name: "createrank",
  aliases: [
    "addrank",
    "newrank",
    "rankcreate",
    "createleaderboard",
    "createlb",
  ],
  description: "Creates a rankable leaderboard",
  type: "ranks",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "name",
        type: "string",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    // Provide args
    const name = args.name.toLowerCase();

    // Check if it already exists
    if (await actions.ranks.exists(name))
      return message.reply(`A leaderboard with that name already exists`);

    // Create it
    await database.run(
      `INSERT INTO ranks (rank_name, created_by) VALUES ((?), (?))`,
      name,
      message.author.id
    );

    return message.reply(
      `Leaderboard created! use \`${serverSettings.prefix}vote ${name} <user mention>\` to vote!`
    );
  },
};

export default command;
