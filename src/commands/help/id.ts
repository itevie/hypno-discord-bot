import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "id",
  description: "Get your Discord ID",
  type: "help",

  handler: (message) => {
    return message.reply(message.author.id);
  },
};

export default command;
