import mongoose from 'mongoose';
import { INITIAL_PRODUCTS } from '../src/data/mock/mockProducts.js';
import { INITIAL_CUSTOMERS } from '../src/data/mock/mockCustomers.js';
import Product from '../src/models/Product.js';
import Customer from '../src/models/Customer.js';

const URI = 'mongodb+srv://hshj15555_db_user:XJFybJ9KUnbHFqqJ@cluster0.ydclgi9.mongodb.net/pos-backend?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(URI);
    console.log('Connected! Checking existing data...');

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log(`Seeding ${INITIAL_PRODUCTS.length} initial products...`);
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log('Products seeded successfully!');
    } else {
      console.log(`Products already exist (${prodCount} products found).`);
    }

    const custCount = await Customer.countDocuments();
    if (custCount === 0) {
      console.log(`Seeding ${INITIAL_CUSTOMERS.length} initial customers...`);
      await Customer.insertMany(INITIAL_CUSTOMERS);
      console.log('Customers seeded successfully!');
    } else {
      console.log(`Customers already exist (${custCount} customers found).`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seed();
