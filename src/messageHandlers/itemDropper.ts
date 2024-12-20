import { User } from "discord.js";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { addItemFor } from "../util/actions/items";
import { database } from "../util/database";
import { createEmbed } from "../util/other";

// So it doesn't send on start
let lastDrop = Date.now() - config.itemDrops.frequency / 2;
let messagesSince = 0;

const handler: HypnoMessageHandler = {
  name: "item-dropper",
  description: "Drops items in a channel every so often",

  handler: async (message) => {
    // Guards
    if (!config.itemDrops.enabled) return;
    if (config.itemDrops.channelExclusions.includes(message.channel.id)) return;
    if (!config.itemDrops.includeChannels.includes(message.channel.id)) return;

    messagesSince++;

    // Check if should send
    if (config.itemDrops.frequency - (Date.now() - lastDrop) < 0) {
      if (messagesSince < 50) return;
      messagesSince = 0;
      lastDrop = Date.now();

      // Get the item to give
      let items = (await database.all(
        `SELECT * FROM items WHERE droppable = true;`
      )) as Item[];
      if (items.length === 0) return;
      let item = items[Math.floor(Math.random() * items.length)];

      // Send message
      let msg = await message.channel.send({
        embeds: [
          createEmbed()
            .setTitle(`Quick! An item has appeared!`)
            .setDescription(`Type "catch" to get a **${item.name}**!`),
        ],
      });

      let collector = msg.channel.createMessageCollector({
        filter: (x) =>
          x.content.toLowerCase() === "catch" ||
          x.content.toLowerCase() === "atchcay",
        time: 30000,
      });

      let caughtBy: User | null = null;
      collector.on("collect", async (msg) => {
        caughtBy = msg.author;
        collector.stop();
        await addItemFor(msg.author.id, item.id);
        return msg.reply(
          `Welldone! You got the **${item.name}**, it has been added to your inventory!`
        );
      });

      collector.on("end", () => {
        msg.edit({
          embeds: [
            createEmbed()
              .setTitle(`The item has expired!`)
              .setDescription(
                caughtBy
                  ? `**${caughtBy.username}** caught the **${item.name}**!`
                  : `No one caught the **${item.name}** in time :(`
              ),
          ],
        });
      });
    }
  },
};

export default handler;
