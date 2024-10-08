import { HypnoCommand } from "../../types/util";
import { getItem } from "../../util/actions/items";
import { database } from "../../util/database";

const command: HypnoCommand<{ itemId: number, newPrice: number }> = {
    name: "setitemprice",
    description: "Sets an items price",
    type: "economy",

    guards: ["bot-owner"],

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "itemId",
                type: "wholepositivenumber"
            },
            {
                name: "newPrice",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Check if item exists
        let item = await getItem(args.itemId);
        if (!item)
            return message.reply(`An item with that ID does not exist`);

        // Update
        await database.run(`UPDATE items SET price = ? WHERE id = ?`, args.newPrice, args.itemId);

        return message.reply(`Updated!`);
    },
};

export default command;