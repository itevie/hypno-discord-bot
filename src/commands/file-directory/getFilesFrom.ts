import { HypnoCommand } from "../../types/util";
import { getFilesFrom, paginateFileList, sources } from "./_util";

const command: HypnoCommand<{ source: string }> = {
  name: "filesfrom",
  aliases: ["getfilesfrom", "filesfromsource", "filesfromdir"],
  description: "Get a list of files from a specific source!",
  type: "file-directory",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "source",
        type: "string",
        oneOf: Object.keys(sources),
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    return paginateFileList(
      message,
      await getFilesFrom(
        args.source,
        serverSettings.allow_nsfw_file_directory_sources
      ),
      `Files from ${args.source}`
    );
  },
};

export default command;
