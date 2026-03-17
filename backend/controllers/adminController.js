const mongoose = require('mongoose');

exports.dropUserIndex = async (req, res) => {
  // This is a sensitive operation. In a real-world app, you'd want to 
  // ensure only highly privileged admins can do this.
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden: Only teachers can perform this action.' });
  }

  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      return res.status(404).json({ message: 'Collection "users" not found.' });
    }

    const indexes = await db.collection('users').listIndexes().toArray();
    const usernameIndex = indexes.find(index => index.name === 'username_1');

    if (usernameIndex) {
      await db.collection('users').dropIndex('username_1');
      res.status(200).json({ message: 'Successfully dropped "username_1" index from users collection.' });
    } else {
      res.status(404).json({ message: 'Index "username_1" not found on users collection.' });
    }
  } catch (error) {
    console.error('Error dropping index:', error);
    res.status(500).json({ message: 'An error occurred while trying to drop the index.', error: error.message });
  }
};
