import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from './users/user.entity';
import { Event } from './events/event.entity';

// Read .env file and set values in process.env
// It works without NestJS (unlike ConfigModule)
dotenv.config();

async function seed() {

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'event_management',
    entities: [User, Event],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const userRepo = dataSource.getRepository(User);
  const eventRepo = dataSource.getRepository(Event);

  // Check if data already exists
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log('Database already has data. Skipping seed.');
    await dataSource.destroy();
    return;
  }

  // Create 2 users
  const password1 = await bcrypt.hash('Password123!', 10);
  const password2 = await bcrypt.hash('Password456!', 10);

  const user1 = userRepo.create({
    email: 'oksana@example.com',
    password: password1,
    name: 'Oksana Melnyk',
  });

  const user2 = userRepo.create({
    email: 'dmytro@example.com',
    password: password2,
    name: 'Dmytro Koval',
  });

  await userRepo.save([user1, user2]);
  console.log('Created 2 users: oksana@example.com, dmytro@example.com');

  // Create 3 public events
  const now = new Date();

  const event1 = eventRepo.create({
    title: 'Morning Yoga in the Park',
    description:
      'Start your weekend with a relaxing outdoor yoga session. All levels welcome! Mats provided.',
    date: new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0),
    location: 'Kyiv, Mariinsky Park',
    capacity: 25,
    visibility: 'public',
    organizer: user1,
    participants: [user2],
  });

  const event2 = eventRepo.create({
    title: 'Contemporary Art Exhibition Opening',
    description:
      'Grand opening of the "Colors of Ukraine" exhibition featuring works by young Ukrainian artists.',
    date: new Date(now.getFullYear(), now.getMonth() + 1, 20, 18, 0),
    location: 'Lviv, Gallery "Dzyga"',
    capacity: 50,
    visibility: 'public',
    organizer: user2,
    participants: [user1],
  });

  const event3 = eventRepo.create({
    title: 'Italian Cooking Masterclass',
    description:
      'Learn to make fresh pasta and tiramisu from scratch. All ingredients included in the price.',
    date: new Date(now.getFullYear(), now.getMonth() + 2, 5, 14, 0),
    location: 'Odesa, Culinary Studio "Smachno"',
    capacity: 12,
    visibility: 'public',
    organizer: user1,
    participants: [],
  });

  await eventRepo.save([event1, event2, event3]);
  console.log('Created 3 public events');

  await dataSource.destroy();
  console.log('Seeding complete!');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
