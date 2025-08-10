// Script to delete all forms, assignments, responses, and notifications from the database
// Run with: node backend/delete-forms-assignments.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function deleteFormsAndAssignments() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const collections = ['forms', 'enhanced_assignments', 'enhanced_responses', 'notifications'];
  let totalDeleted = 0;
  for (const collectionName of collections) {
    const result = await db.collection(collectionName).deleteMany({});
    totalDeleted += result.deletedCount;
    console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
  }
  await client.close();
  console.log(`Total documents deleted: ${totalDeleted}`);
}

deleteFormsAndAssignments().catch(e => { console.error(e); process.exit(1); });
