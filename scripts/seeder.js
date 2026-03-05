import mongoose from "mongoose";
import dotenv from "dotenv";
import { developers } from "../data/developers.js";
import { projects } from "../data/projects.js";
import Developer from "../models/Developer.js";
import Project from "../models/Project.js";
import Property from "../models/Property.js";

dotenv.config();

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

const seedDatabase = async () => {
  try {
    const connectionString = process.env.MONGO_DB;

    // 1. DATABASE NAME VALIDATION
    if (!connectionString.includes("PropertyBulbul")) {
      console.error(
        "❌ ERROR: Your .env connection string is pointing to the wrong database.",
      );
      console.log("Current URI:", connectionString);
      console.log(
        "👉 ACTION: Add '/PropertyBulbul' to the end of your MONGO_DB string in .env",
      );
      process.exit(1);
    }

    await mongoose.connect(connectionString);
    console.log(
      `--- ✅ SUCCESS: Connected to DB: ${mongoose.connection.name} ---`,
    );

    // 2. VERIFY COLLECTION ACCESS
    const count = await Property.countDocuments();
    if (count === 0) {
      console.log("❌ CONNECTION SUCCESSFUL BUT PROPERTIES ARE 0.");
      console.log(
        "Check if your Property model uses a custom collection name.",
      );
      process.exit(1);
    }
    console.log(`Total properties found: ${count}`);

    // 3. REFRESH AUTHORITY DATA
    console.log("Cleaning up and Seeding Developers/Projects...");
    await Developer.deleteMany({});
    await Project.deleteMany({});

    const createdDevs = await Developer.insertMany(developers);
    const projectData = projects.map((p) => ({
      ...p,
      developer: createdDevs.find((d) => d.name === p.developerName)?._id,
      slug: slugify(p.name),
    }));
    const createdProjects = await Project.insertMany(projectData);

    // 4. AGGRESSIVE SMART LINKING
    console.log("Starting link process for 147 properties...");
    for (const project of createdProjects) {
      let keywords = [];
      if (project.name.includes("Sushma"))
        keywords = [/Sushma/i, /Aerocity/i, /Joynest/i, /Zirakpur/i];
      if (project.name.includes("SBP"))
        keywords = [/SBP/i, /Dreams/i, /Sector 115/i, /Kharar/i, /Landran/i];
      if (project.name.includes("Hero"))
        keywords = [/Hero/i, /Sector 88/i, /Mohali/i];

      const result = await Property.updateMany(
        {
          $or: [
            { location: { $in: keywords } },
            { title: { $in: keywords } },
            { description: { $in: keywords } },
          ],
        },
        { $set: { projectId: project._id, isVerified: true } },
      );
      console.log(
        `✅ Linked ${result.modifiedCount} properties to ${project.name}`,
      );
    }

    const finalLinked = await Property.countDocuments({ isVerified: true });
    console.log(
      `\n--- FINISHED: ${finalLinked}/${count} properties are now verified! ---`,
    );

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
