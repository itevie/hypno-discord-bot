import { AttachmentBuilder } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { getMemberCounts } from "../../util/analytics";
import { generateSimpleLineChart } from "../../util/graphs";

const command: HypnoCommand = {
    name: "membercountovertime",
    aliases: ["mover", "mcover", "memberover"],
    type: "analytics",

    handler: async (message) => {
        // Generate
        let image = await generateSimpleLineChart(await getMemberCounts(message.guild.id), "time", "amount", "Member Count Overtime");
        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        // Done
        return message.reply({
            files: [attachment]
        });
    }
}

export default command;