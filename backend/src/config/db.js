const mongoose = require('mongoose');

async function connectDatabase(uri) {
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 4000,
  });
}

module.exports = { connectDatabase };
