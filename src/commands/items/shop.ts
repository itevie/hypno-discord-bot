import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
    name: "shop",
    description: "Get a list of items you can buy",
    type: "economy",

    handler: async (message, { serverSettings }) => {
        let items = await database.all(`SELECT * FROM items;`) as Item[];
        let text: string[] = [];

        for (const item of items) {
            text.push(`**${item.name}** - ${item.price}${config.economy.currency}\n- *${item.description ?? "No description"}*`);
        }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`The Shop`)
                    .setDescription(text.join("\n\n"))
                    .setFooter({ text: `Buy with ${serverSettings.prefix}buy <item>` })
            ]
        });
    }
};

export default command;