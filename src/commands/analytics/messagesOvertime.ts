import { ChartConfiguration } from "chart.js";
import { HypnoCommand } from "../../types/command";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder } from "discord.js";
import { getMessageAtTimes } from "../../util/analytics";

const width = 800;
const height = 400;
const backgroundColour = "#111111";
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const command: HypnoCommand<{ type?: "hours" | "minutes" | "days" }> = {
    name: "messageovertime",
    aliases: ["messagesover", "msgover"],
    type: "analytics",
    description: `Get a graph of the messages in every minute overtime`,

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "type",
                type: "string",
                oneOf: ["hours", "minutes", "days"]
            }
        ]
    },

    handler: async (message, { args }) => {
        let type = args.type ? args.type : "minutes";

        // Get details
        const messages = (await getMessageAtTimes());
        const sorted: { [key: string]: number } = {};

        for (const msg of messages) {
            let date = msg.time;
            let expectedDate: string;

            if (type === "minutes") expectedDate = date;
            else if (type === "hours") expectedDate = date.match(/[0-9]+\/[0-9]+\/[0-9]+ [0-9]+/)[0];
            else expectedDate = date.match(/[0-9]+\/[0-9]+\/[0-9]+/)[0];

            if (!sorted[expectedDate]) sorted[expectedDate] = 0;
            sorted[expectedDate] += msg.amount;
        }

        // Create graph
        const configuration: ChartConfiguration = {
            type: 'line',
            data: {
                labels: Object.keys(sorted),
                datasets: [{
                    label: `Messages Overtime`,
                    data: Object.values(sorted),
                    borderColor: "#FFB6C1"
                }]
            }
        };

        // Create image & attachment
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        // Done
        return message.reply({
            files: [attachment]
        });
    }
};

export default command;