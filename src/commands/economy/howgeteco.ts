import { HypnoCommand } from "../../types/command";
import config from "../../config.json";
import { createEmbed } from "../../util/other";

// Do it here to not waste shit
let embed = createEmbed()
    .setTitle(`Ways to get ${config.economy.currency}!`);
let symbol = config.economy.currency;

for (let i in config.economy) {
    if (["currency"].includes(i)) continue;
    embed.addFields([
        {
            name: `For ${config.economy[i].name}`,
            value: `Min: \`${config.economy[i].min}\`${symbol} Max: \`${config.economy[i].max}\`${symbol}`
                + `${config.economy[i].limit ? `\nEvery: **${config.economy[i].limit / 60000} minutes**` : ""}`
        }
    ]);
}

const command: HypnoCommand = {
    name: "ecoways",
    aliases: ["howtogeteco", "spiralswhere", "iwantspiralsandnow", "iwantspirals"],
    description: "Tells you how to get money",
    type: "economy",

    handler: (message) => {
        return message.reply({ embeds: [embed] });
    }
}

export default command;