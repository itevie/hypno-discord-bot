import config from "../../config";
import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { actions, database } from "../../util/database";
import {
  awardMoneyForCaringForDawn,
  calculateRequirementFromDate,
  generateDawnagotchiEmbed,
} from "../../util/dawnagotchi";
import { currency } from "../../util/textProducer";

const command: HypnoCommand = {
  name: "feed",
  type: "dawnagotchi",
  description: "Feed your Dawn",

  handler: async (message) => {
    // Check if they have a Dawn
    let dawn = await getDawnagotchi(message.author.id);
    if (!dawn) return message.reply(`You don't have a Dawn!`);

    // Check if allowed to feed
    let requirement = calculateRequirementFromDate(dawn.next_feed);

    if (requirement >= 100) return message.reply(`Your Dawn is not hungry!`);

    // Check if they have the power food
    let powerFood = await actions.items.aquired.getFor(
      message.author.id,
      await actions.items.getId(ecoConfig.items.powerFood)
    );
    let timeAdd = config.dawnagotchi.actions.feed.timeAdd;
    if (powerFood && powerFood.amount > 0) {
      timeAdd = timeAdd * 3;
      await actions.items.aquired.removeFor(
        message.author.id,
        await actions.items.getId(ecoConfig.items.powerFood)
      );
    }

    // Add the stuff
    await database.run(
      `UPDATE dawnagotchi SET next_feed = next_feed + ? WHERE owner_id = ?`,
      timeAdd,
      message.author.id
    );

    let money = await awardMoneyForCaringForDawn(dawn);

    // Done
    return message.reply({
      content: money ? `You got ${currency(money)} ` : "",
      embeds: [
        generateDawnagotchiEmbed(await getDawnagotchi(message.author.id)),
      ],
    });
  },
};

export default command;
