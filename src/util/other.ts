import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, HexColorString, Message, User } from "discord.js";
import config from "../config";
import * as fs from "fs";
import { getImpositionFor } from "./actions/imposition";
import path from "path";
import axios from "axios";
import { client } from "..";

const randomCodeCharacters = "abcdefghijklmnopqrstuvwxyz".split("");
const progressBarEmpty = "░";
const progressBarFilled = "█";

/**
 * Gets all files from a directory
 * @param dirPath The path to search
 * @param arrayOfFiles The current array of files
 * @returns An array of files in the directory
 */
export default function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + (dirPath.endsWith("/") ? "" : "/") + file);
        }
    });

    return arrayOfFiles;
}

/**
 * Creates the base embed for all embeds
 * @returns The created embed
 */
export function createEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(config.embed.color as HexColorString)
        .setTimestamp()
        .setColor(config.embed.color as ColorResolvable);
}

/**
 * Returns a random default imposition from the impo.txt
 * @returns The random imposition
 */
export function getRandomImpositionFromFile(): string {
    const data = fs.readFileSync(__dirname + "/../data/impo.txt", "utf-8").split("\n");
    return data[Math.floor(Math.random() * data.length)];
}

/**
 * Gets a random bit of imposition for a user
 * @param forWho The user
 * @param allowBombard Allow bombard impositions
 * @returns The random imposition
 */
export async function getRandomImposition(
    forWho?: string,
    allowBombard: boolean = false
): Promise<string> {
    if (!forWho) return getRandomImpositionFromFile();

    // Get for user
    let impos = (await getImpositionFor(forWho) as UserImposition[]);
    if (allowBombard === false) impos = impos.filter(x => !x.is_bombardable);
    let strImpos = impos.map(x => x.what);

    if (strImpos.length === 0) return getRandomImpositionFromFile();
    return strImpos[Math.floor(Math.random() * strImpos.length)];
}

/**
 * Used for rations, IDK how it works
 * @param a 
 * @param b 
 * @returns 
 */
export function gcd(a: number, b: number): number {
    return (b == 0) ? a : gcd(b, a % b);
}

/**
 * Generates a random code
 * @param length 
 * @returns 
 */
export function generateCode(length: number): string {
    let result = "";
    for (let i = 0; i != length; i++)
        result += randomCodeCharacters[Math.floor(Math.random() * randomCodeCharacters.length)];
    return result;
}

/**
 * Generates a random number given a range
 * @param min Minimum number
 * @param max Maximum number
 * @returns The random number
 */
export function randomFromRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Replaces things like $prefix with the correct things
 * @param embed The embed to fix
 * @param serverSettings The server settings to get stuff from
 * @returns The fixed embed
 */
export function fixMagicVariablesInEmbed(
    embed: EmbedBuilder,
    serverSettings: ServerSettings
): EmbedBuilder {
    // Base stuff
    for (const i in embed) {
        if (typeof embed[i] === "string")
            embed[i] = embed[i].replace(/\$prefix/g, serverSettings.prefix);
    }

    // Fields
    for (const i in embed.data.fields)
        embed.data.fields[i].value = embed.data.fields[i]
            .value
            .replace(/\$prefix/g, serverSettings.prefix);

    return embed;
}

/**
 * Turns a date into the database used date (yyyy/mm/dd hh:mm)
 * @param date The date to convert
 * @returns The converted string
 */
export function formatDate(date: Date): string {
    // Extract components from the date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Combine them into the desired format
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * Creates a backup of the database
 */
export function createBackup() {
    let folder = path.normalize(path.resolve(__dirname, "../../data_backups"));

    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);

    fs.copyFileSync(
        __dirname + "/../../data.db",
        folder + `/${new Date().toDateString().replace(/\//g, "-")}.db`
    );
}

/**
 * Compares how similar to strings are
 * @copyright Stolen from package string-similarity
 * @param first The first string
 * @param second The second string
 * @returns The similarity
 */
export function compareTwoStrings(first: string, second: string): number {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1; // identical or empty
    if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;

        firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

/**
 * Downloads a file to a path
 * @param link The link to download
 * @param path The path to downlod to
 */
export function downloadFile(link: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(path);

        axios.get(link, {
            responseType: "stream"
        }).then(response => {
            response.data.pipe(writer);

            writer.on("error", err => {
                reject(err);
            });

            writer.on("finish", () => {
                resolve();
            });
        });
    });
}

/**
 * Generates a simple ASCII progress bar
 * @param percentage The current progress
 * @param length How long the bar should be
 * @returns The ASCII progress bar
 */
export function makePercentageASCII(percentage: number, length: number): string {
    const percentagePer = 100 / length;
    const amount = Math.round(percentage / percentagePer);

    return `${progressBarFilled.repeat(amount)}${progressBarEmpty.repeat(length - amount)}`;
}

export async function paginate(
    replyTo: Message,
    embed: EmbedBuilder,
    fields: { name: string, value: string }[]
): Promise<Message> {
    // Initial
    let currentIndex = 0;
    let setFields = () => {
        embed.setFields(fields.slice(currentIndex, currentIndex + 10));
        embed.setFooter({
            text: `Page ${(currentIndex / 10) + 1} (${fields.length} items)`
        })
    };
    setFields();

    // Check if there is any more to add
    if (fields.length < 11)
        return replyTo.reply({
            embeds: [embed]
        });

    let message = await replyTo.reply({
        embeds: [embed],
        components: [
            // @ts-ignore
            new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setCustomId(`page-prev`)
                        .setLabel(`<`)
                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                        .setCustomId(`page-next`)
                        .setLabel(`>`)
                        .setStyle(ButtonStyle.Primary)
                ])
        ]
    });

    let collector = message.createMessageComponentCollector({
        filter: i => i.user.id === replyTo.author.id,
    });

    collector.on("collect", async interaction => {
        await interaction.deferUpdate();
        if (interaction.customId === "page-prev") {
            if (currentIndex < 10) return;
            currentIndex -= 10;
            setFields();
        } else if (interaction.customId === "page-next") {
            if (currentIndex > fields.length) return;
            currentIndex += 10;
            setFields();
        }

        await message.edit({
            embeds: [embed]
        });
    });
}

export async function getUser(id: string): Promise<User | null> {
    try {
        return await client.users.fetch(id);
    } catch (e) {
        return null;
    }
}