import { Message, User } from "discord.js";
import { HypnoMessageHandler } from "../types/util";
import { getUserData } from "../util/actions/userData";
import config from "../config";

interface RoleChecker {
    id: string,
    checker: (message: Message) => Promise<boolean>,
}

const roles: { [key: string]: RoleChecker } = {
    "can-request": {
        id: "1282301213278474241",
        checker: async (message: Message) =>
        ((1.728e+8 - (Date.now() - message.member.joinedAt.getTime()) < 0)
            && (await getUserData(message.author.id, message.guild.id)).messages_sent > 50)
    }
}

const handler: HypnoMessageHandler = {
    name: "role-checker",
    description: "Checks if the author should be given any roles",

    handler: async (message) => {
        if (message.guild.id !== config.botServer.id) return;

        for (const i in roles) {
            if (!message.member.roles.cache.some(x => x.id === roles[i].id))
                if (roles[i].checker(message)) {
                    await message.member.roles.add(roles[i].id);
                    console.log(`Gave ${message.author.username} the ${i} role`);
                }
        }
    }
};

export default handler;