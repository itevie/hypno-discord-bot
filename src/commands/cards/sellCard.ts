import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getAllAquiredCardsFor, getCardById } from "../../util/actions/cards";
import { addMoneyFor } from "../../util/actions/economy";
import { computeCardPrice } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ id: number, amount?: number, confirm?: string }> = {
    name: "sellcard",
    description: "Sell one of your cards",
    type: "cards",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            },
            {
                name: "amount",
                type: "wholepositivenumber"
            },
            {
                name: "confirm",
                type: "string",
                mustBe: "confirm"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Get the card
        let card = await getCardById(args.id);
        if (!card)
            return message.reply(`That card does not exist`);

        // Get the card inv
        let aquired = (await getAllAquiredCardsFor(message.author.id)).find(x => x.user_id === message.author.id && x.card_id === card.id);

        let amount = args.amount || 1;

        // Check if has any
        if (!aquired || aquired.amount < amount)
            return message.reply(`You do not have **${amount} ${card.name}** card(s)!`);

        // Get price
        let price = await computeCardPrice(card) * amount;

        // Check if confirm
        if (price > 100 && !args.confirm)
            return message.reply(`Please provide the confirm option to sell **${amount} ${card.name}** for **${price}${config.economy.currency}**`);

        // Remove card & add money
        await database.run(`UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?`, amount, message.author.id, card.id);
        await addMoneyFor(message.author.id, price);

        return message.reply(`You sold **${amount} ${card.name}**(s) for **${price}${config.economy.currency}**!`);
    }
};

export default command;