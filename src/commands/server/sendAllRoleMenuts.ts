import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAllRoleMenus } from "../../util/actions/roleMenus";
import { sendRoleMenu } from "./sendRoleMenu";

const command: HypnoCommand = {
    name: "sendallrolemenus",
    type: "admin",
    adminOnly: true,

    handler: async (message) => {
        // Get & check menus
        let menus = await getAllRoleMenus(message.guild.id);
        if (menus.length === 0)
            return message.reply(`You have no menus!`);

        // Send them
        for await (const menu of menus) {
            await sendRoleMenu(message.channel as TextChannel, menu);
        }
    }
};

export default command;