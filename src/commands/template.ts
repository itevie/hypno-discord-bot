import { HypnoCommand } from "../types/util";

const command: HypnoCommand = {
    name: "template",
    aliases: ["templatecommand"],
    description: "description",

    examples: [],
    usage: [],

    handler: async (message) => {
        return message.reply(`This is a template command!`);
    }
};

export default command;