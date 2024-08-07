import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "id",
    description: "Get your Discord ID",
    type: "help",

    handler: (message, _) => {
        return message.reply(message.author.id);
    }
}

export default command;