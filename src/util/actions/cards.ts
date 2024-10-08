import { database } from "../database";

export async function getDeckByName(name: string): Promise<Deck> {
    return (await database.get(`SELECT * FROM decks WHERE LOWER(name) = LOWER(?)`, name)) as Deck;
}

export async function getDeckById(id: number): Promise<Deck> {
    return (await database.get(`SELECT * FROM decks WHERE id = ?`, id)) as Deck;
}

export async function addCard(name: string, deckID: number, rarity: string, fileName: string, link: string): Promise<Card> {
    return await database.get(`INSERT INTO cards (name, deck, rarity, file_name, link) VALUES (?, ?, ?, ?, ?) RETURNING *`, name, deckID, rarity, fileName, link);
}

export async function getCardById(id: number): Promise<Card | undefined> {
    return await database.get(`SELECT * FROM cards WHERE id = ?`, id);
}

export async function getCardByName(name: string): Promise<Card | undefined> {
    return await database.get(`SELECT * FROM cards WHERE name = ? LIMIT 1;`, name);
}

export async function getAllAquiredCardsFor(userId: string): Promise<AquiredCard[]> {
    return await database.all(`SELECT * FROM aquired_cards WHERE user_id = ?`, userId);
}

export async function getAllAquiredCards(): Promise<AquiredCard[]> {
    return await database.all(`SELECT * FROM aquired_cards`);
}

export async function getAquiredCardsFor(userId: string, cardId: number): Promise<AquiredCard> {
    let result = await database.get(`SELECT * FROM aquired_cards WHERE user_id = ? AND card_id = ?;`, userId, cardId);
    if (!result)
        result = await database.get(`INSERT INTO aquired_cards (card_id, user_id) VALUES (?, ?) RETURNING *`, cardId, userId);
    return result;
}

export async function addCardFor(userId: string, cardId: number, amount: number = 1): Promise<void> {
    await getAquiredCardsFor(userId, cardId);
    await database.run(`UPDATE aquired_cards SET amount = amount + ? WHERE user_id = ? AND card_id = ?;`, amount, userId, cardId);
}

export async function removeCardFor(userId: string, cardId: number, amount: number = 1): Promise<void> {
    await getAquiredCardsFor(userId, cardId);
    await database.run(`UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?;`, amount, userId, cardId);
}