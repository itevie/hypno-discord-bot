import express from "express";
import { readFileSync } from "fs";
import config from "../config";
import Logger from "../util/Logger";
import { database } from "../util/database";
import { getAllGuildsUserData } from "../util/actions/userData";
import { client } from "..";
import { getAllCommandUsage, getMemberCounts, getMessageAtTimes } from "../util/analytics";

const logger = new Logger("website");

export default function initServer() {
    const app = express();

    app.get("/", (_, res) => {
        return res.send(readFileSync(__dirname + "/public/index.html", "utf-8"));
    });

    app.get("/script.js", (_, res) => {
        return res.send(readFileSync(__dirname + "/public/script.js", "utf-8"));
    });

    app.get("/style.css", (_, res) => {
        return res.sendFile(__dirname + "/public/style.css");
    });

    app.get("/data/:type", async (req, res) => {
        switch (req.params.type) {
            case "economy":
                return res.status(200).send({
                    data: await database.all(`SELECT user_id, balance FROM economy;`)
                });
            case "user_data":
                return res.status(200).send({
                    data: await getAllGuildsUserData(config.botServer.id)
                })
            case "member_count":
                return res.status(200).send({
                    data: await getMemberCounts(config.botServer.id)
                })
            case "command_usage":
                return res.status(200).send({
                    data: await getAllCommandUsage()
                })
            case "messages":
                return res.status(200).send({
                    data: await getMessageAtTimes()
                })
            case "usernames":
                let usernames: { [key: string]: string } = {};
                for (const [k, v] of client.users.cache) {
                    usernames[k] = v.username;
                }

                return res.status(200).send({
                    data: usernames,
                });
            default:
                return res.status(400).send("Invalid data type.");
        }
    });

    app.listen(config.website.port, () => {
        logger.log(`Website listening on port ${config.website.port}`);
    });
}