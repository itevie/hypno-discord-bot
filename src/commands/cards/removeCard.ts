import { HypnoCommand } from "../../types/util";
import { computeCardPrice, generateCardEmbed } from "./_util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ card: Card; confirm?: true }> = {
  name: "removecard",
  description: "Removes a card from a deck",
  aliases: ["deletecard"],
  type: "cards",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
      {
        name: "confirm",
        type: "string",
        mustBe: "confirm",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check if confirm
    if (!args.confirm)
      return message.reply({
        content: `Please provide the confirm option`,
        embeds: [await generateCardEmbed(args.card)],
      });

    // Auto sell them
    let amount = 0;
    let cards = await actions.cards.aquired.getAll();
    for await (const card of cards) {
      if (card.card_id === args.card.id && card.amount > 0) {
        await actions.eco.addMoneyFor(
          card.user_id,
          computeCardPrice(args.card) * card.amount
        );
        await actions.cards.removeFor(card.user_id, card.card_id, card.amount);
        amount += card.amount;
      }
    }

    // Delete
    await database.run(
      `DELETE FROM aquired_cards WHERE card_id = ?`,
      args.card.id
    );
    await database.run(`DELETE FROM cards WHERE id = ?`, args.card.id);

    return message.reply(`Card deleted! Sold ${amount} of them automatically`);
  },
};

export default command;
