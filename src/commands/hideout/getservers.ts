import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "getservers",
    hideoutOnly: true,
    adminOnly: true,

    handler: async (message, _) => {
        const guilds = await message.client.guilds.fetch();
        return message.reply(`List of servers I'm in: ${guilds.map(x => x.name).join(", ")}`);
    }
}

export default command;