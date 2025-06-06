import { database } from "../database";

const _actions = {
  exists: async (
    user1: string,
    user2: string,
    type: RelationshipType
  ): Promise<boolean> => {
    const way1 = await database.get<Relationship>(
      "SELECT * FROM relationships WHERE user1 = ? AND user2 = ? AND type = ?",
      user1,
      user2,
      type
    );
    if (way1) return true;

    if (type === "married" || type === "dating") {
      const way2 = await database.get<Relationship>(
        "SELECT * FROM relationships WHERE user1 = ? AND user2 = ? AND type = ?",
        user2,
        user1,
        type
      );
      return !!way2;
    }

    return false;
  },

  create: async (
    user1: number,
    user2: number,
    type: RelationshipType
  ): Promise<Relationship> => {
    return await database.get<Relationship>(
      "INSERT INTO relationships (user1, user2, type) VALUES (?, ?, ?) RETURNING *",
      user1,
      user2,
      type
    );
  },

  current: async (user1: string, user2: string): Promise<Relationship[]> => {
    return await database.all<Relationship[]>(
      "SELECT * FROM relationships WHERE user1 = ? AND user2 = ?",
      user1,
      user2
    );
  },

  currentFor: async (user1: string, user2: string): Promise<Relationship[]> => {
    return await database.all<Relationship[]>(
      "SELECT * FROM relationships WHERE user1 = ? AND user2 = ?",
      user1,
      user2
    );
  },

  set: async (
    user1: string,
    user2: string,
    type: RelationshipType
  ): Promise<void> => {
    if (type === "married" || type === "dating" || type === "parent") {
      await database.run(
        "DELETE FROM relationships WHERE user1 = ? AND user2 = ?",
        user2,
        user1
      );
    }

    await database.run(
      "DELETE FROM relationships WHERE user1 = ? AND user2 = ?",
      user1,
      user2
    );

    await database.run(
      `INSERT INTO relationships (user1, user2, type) VALUES (?, ?, ?)`,
      user1,
      user2,
      type
    );
  },

  add: async (
    user1: string,
    user2: string,
    type: RelationshipType
  ): Promise<void> => {
    if (type === "married" || type === "dating" || type === "parent") {
      await database.run(
        "DELETE FROM relationships WHERE user1 = ? AND user2 = ?",
        user2,
        user1
      );
    }

    /*await database.run(
      "DELETE FROM relationships WHERE user1 = ? AND user2 = ?",
      user1,
      user2
    );*/

    await database.run(
      `INSERT INTO relationships (user1, user2, type) VALUES (?, ?, ?)`,
      user1,
      user2,
      type
    );
  },

  getAll: async (): Promise<Relationship[]> => {
    return await database.all<Relationship[]>("SELECT * FROM relationships");
  },

  delete: async (user1: string, user2: string): Promise<void> => {
    await database.run(
      `DELETE FROM relationships WHERE user1 = ? AND user2 = ?`,
      user1,
      user2
    );
  },

  deleteFor: async (user1: string, user2: string): Promise<void> => {
    await database.run(
      `DELETE FROM relationships WHERE (user1 = ? AND user2 = ?) OR (user2 = ? AND user1 = ?) `,
      user1,
      user2,
      user1,
      user2
    );
  },

  deleteType: async (
    user1: string,
    user2: string,
    type: RelationshipType
  ): Promise<void> => {
    await database.run(
      `DELETE FROM relationships WHERE ((user1 = ? AND user2 = ?) OR (user2 = ? AND user1 = ?)) AND type = ?`,
      user1,
      user2,
      user1,
      user2,
      type
    );
  },

  getFor: async (
    userId: string,
    type: RelationshipType
  ): Promise<Relationship[]> => {
    return await database.all(
      `SELECT * FROM relationships WHERE user2 = ? AND type = ?`,
      userId,
      type
    );
  },
} as const;

export default _actions;
