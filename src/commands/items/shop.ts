import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { calculateItemPrice } from "../../util/items";
import { createEmbed, paginate } from "../../util/other";
import { currency, itemText } from "../../util/textProducer";

const command: HypnoCommand<{ tag?: string }> = {
  name: "shop",
  aliases: ["store"],
  description: "Get a list of items you can buy",
  type: "economy",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "tag",
        type: "string",
      },
    ],
  },

  handler: async (message, { serverSettings, args }) => {
    let items = (await database.all(`SELECT * FROM items;`)) as Item[];
    if (args.tag) items = items.filter((x) => x.tag === args.tag.toLowerCase());

    return paginate({
      replyTo: message,
      embed: createEmbed()
        .setTitle("The Shop")
        .setFooter({ text: `Buy with ${serverSettings.prefix}buy <item>` })
        .setTimestamp(null),
      type: "description",
      data: items.map(
        (item) =>
          `${itemText(item)} - ${!item.buyable ? "~~" : ""}buy ${currency(
            item.price
          )}${!item.buyable ? "~~" : ""} sell ${currency(
            calculateItemPrice(item)
          )} (${(item.weight * 100).toFixed(0)}% weight)\n- *${
            item.description ?? "No description"
          }${item.tag ? ` [${item.tag}]` : ""}*`
      ),
    });
  },
};

export default command;
