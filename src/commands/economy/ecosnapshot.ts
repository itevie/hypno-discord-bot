import { HypnoCommand } from "../../types/command";
import { getAllEconomy } from "../../util/actions/economy";
import * as fs from "fs";
import * as path from "path";

const command: HypnoCommand = {
    name: "ecosnapshot",
    adminOnly: true,
    type: "economy",

    handler: async (message) => {
        const ecos = await getAllEconomy();
        let dirLocation = path.resolve(__dirname + "/../../data/ecosnapshots");

        // Check if folder exists
        if (!fs.existsSync(dirLocation))
            fs.mkdirSync(dirLocation);

        let name = new Date().toLocaleDateString().replace(/\//g, "-") + ".json";
        fs.writeFileSync(dirLocation + "/" + name, JSON.stringify({ data: ecos }));
        return message.reply(`Snapshot saved as: ${name}`);
    }
};

export default command;