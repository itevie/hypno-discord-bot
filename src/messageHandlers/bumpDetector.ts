import { HypnoMessageHandler } from "../types/util";
import { addBump } from "../util/actions/userData";
import config from "../config";
import { addMoneyFor } from "../util/actions/economy";
import { createEmbed, randomFromRange } from "../util/other";
import { database } from "../util/database";
import { client } from "..";

setInterval(async () => {
  let bumps = await database.all<ServerSettings[]>(
    "SELECT * FROM server_settings WHERE remind_bumps = true AND bump_channel IS NOT NULL;"
  );

  for (const serverSettings of bumps) {
    // Compute
    if (7.2e6 - (Date.now() - serverSettings.last_bump) < 0) {
      if (!serverSettings.bump_reminded) {
        await database.run(
          `UPDATE server_settings SET bump_reminded = true WHERE server_id = ?;`,
          serverSettings.server_id
        );

        // Send message
        let channel = await client.channels.fetch(serverSettings.bump_channel);
        if (channel.isTextBased()) {
          await channel.send({
            content: `${
              serverSettings.last_bumper
                ? `<@${
                    (
                      await client.users.fetch(serverSettings.last_bumper)
                    ).id
                  }>`
                : ""
            }`,
            embeds: [
              createEmbed()
                .setTitle("It's time to bump!")
                .setDescription(`Run \`/bump\` with DISBOARD to help us grow!`),
            ],
          });
        }
      }
    }
  }
}, 1000);

const handler: HypnoMessageHandler = {
  name: "bump-detector",
  description: "Detects /bump and adds to leaderboard",
  botsOnly: true,

  handler: async (message) => {
    // Check if the message is sent by Disboard & the embed contains "Bump done!"
    if (
      message.author.id === "302050872383242240" &&
      message.embeds[0].data.description.includes("Bump done!")
    ) {
      // Get the authors ID
      let user = message.interaction.user;

      await addBump(user.id, message.guild.id);
      await database.run(
        `UPDATE server_settings SET last_bump = ? WHERE server_id = ?;`,
        Date.now(),
        message.guild.id
      );
      await database.run(
        `UPDATE server_settings SET bump_reminded = false WHERE server_id = ?;`,
        message.guild.id
      );
      await database.run(
        `UPDATE server_settings SET last_bumper = ? WHERE server_id = ?;`,
        user.id,
        message.guild.id
      );

      // Check for bot server
      if (message.guild.id === config.botServer.id) {
        let money = randomFromRange(
          config.economy.bump.min,
          config.economy.bump.max
        );

        await message.reply({
          embeds: [
            createEmbed()
              .setTitle(`${user.username}, thanks for bumping our server!`)
              .setDescription(
                `You have been awarded **${money}${config.economy.currency}**\n\nI will remind you again in **2 hours**!`
              ),
          ],
        });
        await addMoneyFor(user.id, money, "helping");
      } else {
        await message.reply({
          embeds: [
            createEmbed()
              .setTitle(`${user.username}, thanks for bumping our server!`)
              .setDescription(`I will remind you again in **2 hours**!`),
          ],
        });
      }
    }
  },
};

export default handler;
