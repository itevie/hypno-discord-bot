import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getEconomyFor, removeMoneyFor } from "../../util/actions/economy";
import { database } from "../../util/database";
import { currency } from "../../util/textProducer";

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

    const economy = await getEconomyFor(message.author.id);
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
    await removeMoneyFor(message.author.id, 2500);

    return message.reply(`Your Dawn was revived for ${currency(2500)}`);
  },
};

export default command;
