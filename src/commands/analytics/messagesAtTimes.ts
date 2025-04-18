import { ChartConfiguration, ChartType } from "chart.js";
import { HypnoCommand } from "../../types/util";
import { getMessageAtTimes } from "../../util/analytics";
import { AttachmentBuilder } from "discord.js";
import { ChartCallback, ChartJSNodeCanvas } from "chartjs-node-canvas";
import { units } from "../../util/ms";

const width = 800;
const height = 400;
const backgroundColour = "#111111";
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
  type: "pdf",
});

const command: HypnoCommand = {
  name: "messagesattimes",
  description: "See the average times messages were sent",
  type: "analytics",
  aliases: ["mat"],
  ratelimit: units.minute * 5,

  handler: async (message) => {
    const messages = (await getMessageAtTimes())
      .map((x) => {
        return {
          hour: parseInt(x.time.match(/([0-9]+):[0-9]+/)[1]),
          amount: x.amount,
        };
      })
      .reduce((p, c) => {
        return { ...p, [c.hour]: (p[c.hour] ?? 0) + c.amount };
      }, {});

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dataset = hours.map((hour) => messages[hour] ?? 0);

    const configuration: ChartConfiguration = {
      type: "bar",
      data: {
        labels: hours.map((h) => `${h}:00`), // Format labels as "0:00", "1:00", etc.
        datasets: [
          {
            label: "Messages Sent (GMT)",
            data: dataset,
            backgroundColor: "#FFB6C1",
            borderColor: "#FFB6C1",
            borderWidth: 1,
          },
        ],
      },
    };

    const chartCallback: ChartCallback = (ChartJS) => {
      ChartJS.defaults.responsive = true;
      ChartJS.defaults.maintainAspectRatio = false;
    };
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      chartCallback,
      backgroundColour: "#111111",
    });
    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    /* const chartConfig: ChartConfiguration
    console.log(chartConfig);

    const image = await chartJSNodeCanvas.renderToBuffer(chartConfig)*/ const attachment =
      new AttachmentBuilder(buffer).setFile(buffer);

    // Done
    return message.reply({
      files: [attachment],
    });
  },
};

export default command;
