import fs from "fs";
import { client } from "..";
let path = __dirname + "/../data/cached_usernames.json";
if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");
let usernames = JSON.parse(fs.readFileSync(path, "utf-8"));

export async function getUsername(id: string): Promise<string> {
  let username: string;

  if (client.users.cache.has(id)) {
    username = client.users.cache.get(id).username;
    if (usernames[id] !== username) {
      usernames[id] = username;
      fs.writeFileSync(path, JSON.stringify(usernames));
    }
  } else if (usernames[id]) {
    username = usernames[id];
  } else {
    console.log(`Fetching username ${id}`);
    username = (await client.users.fetch(id)).username;
    usernames[id] = username;
    fs.writeFileSync(path, JSON.stringify(usernames));
  }

  return username;
}