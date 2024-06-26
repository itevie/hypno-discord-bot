import { HypnoCommand } from "../../types/command";
import { getRandomSpiral, getSpirals } from "../../util/actions/spirals";

const command: HypnoCommand = {
    name: "spiral",
    type: "spirals",
    aliases: ["s"],
    description: "Sends a random spiral :cyclone:",
    usage: [
        ["spiral list", "List the amount of spirals registered"],
    ],

    handler: async (message, args) => {
        if (args[0] === "list") {
            return message.reply(`There are ${(await getSpirals()).length} spirals registered`);
        }

        return message.channel.send(
            (await getRandomSpiral()).link
                .replace(/^(<)/, "")
                .replace(/(>)$/, "")
        );
    }
}

export default command;