const { seedDatabase } = require('./dist/seed.js');

// Run the seed function
seedDatabase().catch(console.error);