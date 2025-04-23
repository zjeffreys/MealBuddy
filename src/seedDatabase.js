import { seedDatabase } from './data/seedData.js';

// Run the seeding process
seedDatabase().then(() => {
  console.log('Seeding complete!');
  process.exit(0);
}).catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
}); 