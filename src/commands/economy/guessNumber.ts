import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { createEmbed, randomFromRange } from "../../util/other";
import { addMoneyFor, removeMoneyFor } from "../../util/actions/economy";

const command: HypnoCommand = {
    name: "guessnumber",
    type: "economy",
    description: `You have 3 guesses to guess the bot's number to gain some ${config.economy.currency}`,

    handler: async (message) => {
        let buttons: ButtonBuilder[] = [];
        let botsNumber = randomFromRange(1, 9);
        let guessed = 0;

        // Generate buttons
        for (let i = 1; i != 10; i++) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`guessnumber-${i}`)
                    .setLabel(`${i}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Function to turn the buttons into 3 action rows
        let generateActionRow: () => ActionRowBuilder[] = () => {
            return [
                new ActionRowBuilder()
                    .addComponents(...buttons.slice(0, 3)),
                new ActionRowBuilder()
                    .addComponents(...buttons.slice(3, 6)),
                new ActionRowBuilder()
                    .addComponents(...buttons.slice(6, 9))
            ];
        }

        let baseDescription = `I have a number from **1 to 9**, you have 3 tries to guess it correct to win ${config.economy.currency}!`;

        // Create message
        let botMsg = await message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Guess Number`)
                    .setDescription(baseDescription)
            ],
            // @ts-ignore
            components: [
                ...generateActionRow()
            ]
        });

        // Create collector
        const collector = botMsg.createMessageComponentCollector({
            filter: interaction => interaction.user.id === message.author.id
        });
        let pastInteraction: ButtonInteraction | null = null;

        // Listen for updates
        collector.on("collect", async interaction => {
            let number = parseInt(interaction.customId.match(/[0-9]/)[0]);

            // Update buttons
            buttons[number - 1].setDisabled(true);
            await botMsg.edit({
                // @ts-ignore
                components: [
                    ...generateActionRow()
                ]
            });

            await interaction.deferUpdate();

            let updateMessage = async (message: string) => {
                await botMsg.edit({
                    embeds: [
                        createEmbed()
                            .setTitle(`Guess Number`)
                            .setDescription(baseDescription + `\n\n${message}`)
                    ]
                });
            };

            // Check if correct number
            if (number === botsNumber) {
                collector.stop();

                // Calculate win
                let baseReward = randomFromRange(config.economy.guessNumber.min, config.economy.guessNumber.max);
                let multipliedReward = baseReward * (3 - guessed);

                // Give money
                await addMoneyFor(message.author.id, multipliedReward, "gambling");
                await message.reply(`Welldone! You guessed the number **${botsNumber}** in **${guessed}** guesses! You got **${multipliedReward}${config.economy.currency}**`);
                return;
            }

            // Check if ran out of guesses
            else if (guessed >= 2) {
                collector.stop();

                // Remove money
                let amount = config.economy.guessNumber.punishment;
                await removeMoneyFor(message.author.id, amount, true);
                await message.reply(`Oops... you weren't able to get the number correct in 3 guesses! The number was **${botsNumber}**! You lost **${amount}${config.economy.currency}**`)
                return;
            }

            // Lost, but they still have guesses
            else {
                guessed++;

                // Send message
                await updateMessage(`That's not correct! You now have **${3 - guessed}** guesses!\nMy number is: **${number > botsNumber ? "lower" : "higher"}**`);
            }
        });
    }
}

export default command;