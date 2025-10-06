import { seedDatabase } from './seed';

// Run the seed function
seedDatabase().catch(console.error);