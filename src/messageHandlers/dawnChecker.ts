import config from "../config";
import ecoConfig from "../ecoConfig";
import { HypnoMessageHandler } from "../types/util";
import { getDawnagotchi, removeDawnagotchi } from "../util/actions/dawnagotchi";
import { removeMoneyFor } from "../util/actions/economy";
import {
  generateDawnagotchiEmbed,
  getDawnagotchiRequirements,
} from "../util/dawnagotchi";
import { currency } from "../util/textProducer";

const handler: HypnoMessageHandler = {
  name: "dawn-checker",
  description: "Checks the message author's Dawn's requirements",

  handler: async (message) => {
    // Fetch and check if they have a Dawn
    let dawn = await getDawnagotchi(message.author.id);
    if (!dawn) return;

    // Get requirements
    let requirements = getDawnagotchiRequirements(dawn);

    // Check...
    if (
      requirements.drink === 0 ||
      requirements.feed === 0 ||
      requirements.play === 0
    ) {
      await removeDawnagotchi(message.author.id);
      let messages: string[] = [];

      // Add messages
      if (requirements.drink === 0)
        messages.push(`Your Dawn got too thirsty...`);
      if (requirements.feed === 0) messages.push(`Your Dawn got too hungry...`);
      if (requirements.play === 0)
        messages.push(`Your Dawn didn't get enough attention...`);

      // Remove money
      await removeMoneyFor(
        message.author.id,
        ecoConfig.payouts.dawn.punishment
      );

      // Send message
      await message.reply({
        content: `Uh oh... Your Dawn has left you...\n\n${messages.join(
          "\n"
        )}\n\nYou lost ${currency(ecoConfig.payouts.dawn.punishment)}`,
        embeds: [generateDawnagotchiEmbed(dawn)],
      });
    }
  },
};

export default handler;
