import { HypnoCommand } from "../../types/command";
import { getRandomImposition } from "../../util/other";

const command: HypnoCommand = {
    name: "imposition",
    aliases: ["i", "impo"],
    description: "Send a some nice, fuzzy imposition",
    type: "imposition",
    usage: [
        ["$cmd <user>", "Gives another user the imposition! :)"]
    ],

    handler: async (message, args) => {
        if (args[0]) {
            const user = args[0].replace(/[<>@]/g, "");
            return message.channel.send(`${args.join(" ")} ${await getRandomImposition(user)}`);
        }
        return message.reply(await getRandomImposition(message.author.id));
    }
}

export default command;