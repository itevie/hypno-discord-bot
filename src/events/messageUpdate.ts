import { client } from "..";
import config from "../config";
import { createEmbed } from "../util/other";

client.on("messageUpdate", async (old, newMsg) => {
    if (newMsg.author.bot) return;

    const channel = await client.channels.fetch(config.botServer.channels.logs);
    if (channel.isTextBased()) {
        await channel.send({
            embeds: [
                createEmbed()
                    .setTitle(`Message Eited in #${(newMsg.channel as any).name}`)
                    .setDescription(newMsg.content || "*No content*")
                    .addFields([
                        {
                            name: "Old Content",
                            value: old.content || "*No Content*"
                        }
                    ])
                    .setColor("#FFFF00")
                    .setAuthor({
                        iconURL: newMsg.author.displayAvatarURL(),
                        name: newMsg.author.username
                    })
            ]
        });
    }
});