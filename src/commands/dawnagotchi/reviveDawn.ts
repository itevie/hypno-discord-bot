import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import { currency } from "../../util/language";

const command: HypnoCommand = {
  name: "revivedawn",
  description: "Revive your dawn",
  type: "dawnagotchi",

  handler: async (message, { oldArgs }) => {
    const dawn = await database.get<Dawnagotchi>(
      "SELECT * FROM dawnagotchi WHERE owner_id = ? ORDER BY id DESC LIMIT 1;",
      message.author.id
    );

    if (dawn.alive) {
      return message.reply(`Your Dawn is alive!`);
    }

    if (oldArgs[0] !== "confirm") {
      return message.reply(
        `Please provide the "confirm" option, this will cost you ${currency(
          2500
        )}`
      );
    }

    const economy = await actions.eco.getFor(message.author.id);
    if (economy.balance < 2500)
      return message.reply(
        `You need ${currency(2500)} to revive your Dawn, you horrible person.`
      );

    await database.run(
      `UPDATE dawnagotchi SET alive = true, next_feed = ?, next_drink = ?, next_play = ? WHERE id = ?;`,
      Date.now(),
      Date.now(),
      Date.now(),
      dawn.id
    );
    await actions.eco.removeMoneyFor(message.author.id, 2500);

    return message.reply(`Your Dawn was revived for ${currency(2500)}`);
  },
};

export default command;
