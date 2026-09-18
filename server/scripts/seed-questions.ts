/**
 * Seed Script for Company Questions
 *
 * This script seeds the Pinecone vector database with sample company questions.
 * Run this once to populate the question bank.
 *
 * Usage: npx ts-node scripts/seed-questions.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { seedCompanyQuestions } from "../src/services/seed.service";

async function main() {
  console.log("🌱 Starting to seed company questions...\n");

  // Check for required environment variables
  if (!process.env.PINECONE_API_KEY) {
    console.error("❌ Error: PINECONE_API_KEY is not set");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Error: OPENAI_API_KEY is not set");
    process.exit(1);
  }

  try {
    const result = await seedCompanyQuestions();

    if (result.success) {
      console.log(
        `\n✅ Successfully seeded ${result.questionsIndexed} company questions!`
      );
      console.log("\nThe following companies are now available:");
      console.log("  • Google");
      console.log("  • Amazon");
      console.log("  • Microsoft");
      console.log("  • Meta");
      console.log("  • Apple");
      console.log("  • Netflix");
      console.log("  • Stripe");
      console.log("  • Uber");
    } else {
      console.error(`\n❌ Failed to seed questions: ${result.error}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("\n❌ Error seeding questions:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
