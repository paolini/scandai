module.exports = {
  /**
   * Migrates passwords from users collection to account collection for Better Auth.
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const usersCollection = db.collection('users');
    const accountCollection = db.collection('account');

    // Find all users with a password field
    const usersWithPassword = await usersCollection.find({ password: { $exists: true } }).toArray();

    let migrated = 0;
    let skipped = 0;

    for (const user of usersWithPassword) {
      // Check if account entry already exists
      const existingAccount = await accountCollection.findOne({
        userId: user._id,
        providerId: 'credential'
      });

      if (existingAccount) {
        skipped++;
        continue;
      }

      // Create account entry with userId as ObjectId (not string!)
      await accountCollection.insertOne({
        userId: user._id,  // Keep as ObjectId
        providerId: 'credential',
        accountId: user.username || user.email,
        password: user.password,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      migrated++;
    }

    console.log(`Password migration: ${migrated} users migrated, ${skipped} skipped (already migrated)`);
  },

  /**
   * Rollback: remove account entries created by this migration
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const accountCollection = db.collection('account');
    const result = await accountCollection.deleteMany({ providerId: 'credential' });
    console.log(`Rollback: deleted ${result.deletedCount} credential accounts`);
  }
};
