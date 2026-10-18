module.exports = {
  // Better Auth now locates credential accounts by userId AND accountId=user.id.
  // Previous Scandai migration used username/email as accountId instead.
  async up(db) {
    await db.collection('account').updateMany({
      providerId: 'credential',
      userId: { $type: ['objectId', 'string'] },
      accountId: { $exists: true },
      scandaiLegacyAccountId: { $exists: false },
      $expr: { $ne: ['$accountId', { $toString: '$userId' }] },
    }, [{
      $set: {
        scandaiLegacyAccountId: '$accountId',
        accountId: { $toString: '$userId' },
      },
    }])
  },

  async down(db) {
    await db.collection('account').updateMany({
      providerId: 'credential',
      scandaiLegacyAccountId: { $exists: true },
    }, [
      { $set: { accountId: '$scandaiLegacyAccountId' } },
      { $unset: 'scandaiLegacyAccountId' },
    ])
  },
}
