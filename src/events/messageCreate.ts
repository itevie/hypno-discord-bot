import { PermissionsBitField, User } from "discord.js";
import { client, commands, handlers } from "..";
import { HypnoCommandDetails } from "../types/command";
import { createEconomyFor, economyForUserExists } from "../util/actions/economy";
import { getServerSettings, setupSettingsFor } from "../util/actions/settings";
import { createUserData, userDataExists } from "../util/actions/userData";
import { generateCommandCodeBlock } from "../util/args";
import { database } from "../util/database";
import config from "../config";

client.on("messageCreate", async message => {
    // German commas go away
    message.content = message.content.replace(/[’]/g, "'");

    for (const i in handlers)
        if (handlers[i].botsOnly)
            handlers[i].handler(message);

    // Disallow bots
    if (message.author.bot) return;
    if (!database) return;

    // Check for user_data
    if (!await userDataExists(message.author.id, message.guild.id))
        await createUserData(message.author.id, message.guild.id);

    // Check for economy
    if (!await economyForUserExists(message.author.id))
        await createEconomyFor(message.author.id);

    // Setup settings
    if (!await getServerSettings(message.guild.id))
        await setupSettingsFor(message.guild.id);
    const settings = await getServerSettings(message.guild.id);

    if (message.content.trim() == `<@${client.user.id}>`)
        return message.reply(`Hey! My prefix is: \`${settings.prefix}\`\nUse \`${settings.prefix}commands\` to view my commands!\nAnd use \`${settings.prefix}about\` to learn about me! :cyclone:`);

    // Check handlers
    for (const i in handlers)
        if (!handlers[i].botsOnly) {
            if (handlers[i].noCommands) {
                if (message.content.startsWith(settings.prefix))
                    continue;
            }
            handlers[i].handler(message);
        }

    if (!message.content.startsWith(settings.prefix) && !message.content.startsWith(settings.prefix + " ")) return;

    // Extract command
    const content = message.content.substring(settings.prefix.length, message.content.length).trim();
    const fullArgs = content.split(" ");
    const command = fullArgs.shift().toLowerCase();

    try {
        // Check if command was found
        if (commands[command]) {
            const cmd = commands[command];
            const details: HypnoCommandDetails<any> = {
                serverSettings: settings,
                command,
                args: {},
                oldArgs: fullArgs,
            };

            // Function to actually execute the command if wanted
            const execute = async () => {
                // Check if the cmd requires arguments
                if (cmd.args) {
                    const codeblock = generateCommandCodeBlock(cmd, settings);
                    for (let i in cmd.args.args) {
                        let arg = cmd.args.args[i];

                        // Check if it is there (and required)
                        if (!fullArgs[i] && cmd.args.requiredArguments > +i)
                            return message.reply(`The paramter **${arg.name}** is missing!\n${codeblock}`);
                        if (!fullArgs[i])
                            continue;

                        // Check type (special ones)
                        if (arg.type === "user") {
                            if (!fullArgs[i].match(/<?@[0-9]+?>?/))
                                return message.reply(`Invalid user format provided, please provide a mention or ID!\n${codeblock}`)
                            // Try fetch user
                            let user: User;
                            try {
                                user = await client.users.fetch(fullArgs[i].replace(/[<>@]/g, ""));
                            } catch (err) {
                                console.log(err);
                                return message.reply(`Failed to fetch the user: ${fullArgs[i]} :(`);
                            }

                            // Set argument
                            details.args[arg.name] = user;
                        } else {
                            // Check for numbers
                            if (arg.type === "number")
                                if (isNaN(parseInt(fullArgs[i])))
                                    return message.reply(`Invalid number provided for **${arg.name}**: ${fullArgs[i]}\n${codeblock}`);
                                else details.args[arg.name] = parseInt(fullArgs[i]);
                            else if (arg.type === "wholepositivenumber")
                                if (isNaN(parseInt(fullArgs[i])) || parseInt(fullArgs[i]) < 0 || parseInt(fullArgs[i]) % 1 !== 0)
                                    return message.reply(`Expected positive, whole number for **${arg.name}**: ${fullArgs[i]}\n${codeblock}`);
                                else details.args[arg.name] = parseInt(fullArgs[i]);
                            // If its a string it can just go right through
                            else if (arg.type === "string")
                                details.args[arg.name] = fullArgs[i];

                            if (arg.mustBe) {
                                if (details.args[arg.name] !== arg.mustBe)
                                    return message.reply(`Argument **${arg.name}** must be: **${arg.mustBe}**\n${codeblock}`);
                            }
                        }
                    }
                }

                // Finally, run it.
                await cmd.handler(message, details);
            };
            const except = () => { if (cmd.except) return cmd.except(message, fullArgs); else return false; };

            // Used to ignore guards
            if (cmd.allowExceptions && config.exceptions.includes(message.author.id))
                return await execute();

            // Check if AI is turned off
            if (cmd.type === "ai" && !config.modules.ai.enabled)
                return message.reply(`AI is disabled! :cyclone:`);

            // Check if bot owner only
            if (cmd.botOwnerOnly && message.author.id !== config.owner)
                return message.reply(`Only the bot owner can run this command!`);

            // Check if command is admin only
            if (cmd.adminOnly)
                if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !except())
                    return message.reply(`You are not administrator :cyclone:`);

            // Check if commandis bot-server only
            if (cmd.botServerOnly && message.guild.id !== config.botServer.id)
                return message.reply(`This command can only be used in the bot server :cyclone:`);

            // Execute
            await execute();
        }
    } catch (err) {
        await message.reply(`Oops... I ran into an error whilst trying to run that command :(`);
        throw err;
    }
});