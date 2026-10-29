// Re-seeds flatmates data with clean, fully-linked new-schema docs.
// Deletes orphaned old profiles and creates fresh have_room + no_room profiles.
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import RoommateProfile from "../models/RoommateProfile.js";
import RoomFlat from "../models/RoomFlat.js";
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_DB;
if (!MONGO_URI) {
  console.error("❌ MONGO_DB not set");
  process.exit(1);
}

const CITIES = [
  { city: "Chandigarh", locality: "Sector 21", lng: 76.7694, lat: 30.7333 },
  { city: "Mohali", locality: "Sector 66", lng: 76.7158, lat: 30.6807 },
  { city: "Zirakpur", locality: "Sector 4", lng: 76.7637, lat: 30.6016 },
  { city: "Panchkula", locality: "Sector 5", lng: 76.9842, lat: 30.6996 },
];

const HABITS = {
  smoking: "no",
  drinking: "yes",
  nightlifeFriendly: "no",
  foodPreference: "veg",
  ownsPets: false,
  okayWithPets: true,
  cleanlinessLevel: "very_tidy",
  guestsFrequency: "sometimes",
};

const LOOKING_FOR = {
  genderPreference: "any",
  ageRange: { min: 22, max: 34 },
  smoking: "no_preference",
  drinking: "no_preference",
  nightlifeFriendly: "no_preference",
  foodPreference: "any",
  occupation: "any",
};

const CITY_META = (i) => CITIES[i];

const SPECS = [
  { type: "have_room", email: "sandeep2001saini01@gmail.com", city: 1, rent: "12000" },
  { type: "have_room", email: "kajalsahota62@gmail.com", city: 2, rent: "6500" },
  { type: "have_room", email: "manish.tiwari0923@gmail.com", city: 1, rent: "14000" },
  { type: "no_room", email: "anshigarg0101@gmail.com", city: 0, budgetRange: { min: "5000", max: "12000" } },
  { type: "no_room", email: "raoaurangzeb17@gmail.com", city: 2, budgetRange: { min: "4000", max: "10000" } },
  { type: "no_room", email: "sandeepsaini157219@gmail.com", city: 3, budgetRange: { min: "5000", max: "15000" } },
];

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: "PropertyBulbul" });

  // 1. Remove any existing profile for our target users (idempotent re-run).
  const targetUserIds = new Set(
    (
      await User.find(
        { email: { $in: SPECS.map((s) => s.email) } },
        "_id",
      )
    ).map((u) => u._id.toString()),
  );
  if (targetUserIds.size > 0) {
    await RoommateProfile.deleteMany({ user: { $in: [...targetUserIds] } });
    console.log(`🗑️  Removed existing profiles for ${targetUserIds.size} target user(s).`);
  }

  // 2. Delete orphaned old profiles. An orphan is a profile whose `user`
  //    reference points at a user that does not exist in the database.
  const userIds = new Set(targetUserIds);
  const allProfiles = await RoommateProfile.find({}).lean();
  const orphaned = allProfiles.filter((p) => {
    const u = p.user?.toString?.();
    return !u || !userIds.has(u);
  });
  for (const p of orphaned) {
    await RoommateProfile.deleteOne({ _id: p._id });
    console.log(`🗑️  Deleted orphaned profile ${p._id}`);
  }

  for (const s of SPECS) {
    const city = CITIES[s.city];
    const user = await User.findOne({ email: s.email });
    if (!user) {
      console.warn(`⚠️  Skipping ${s.email} — no such user`);
      continue;
    }

    const profile = await RoommateProfile.create({
      user: user._id,
      type: s.type,
      ...(s.type === "no_room"
        ? {
            searchArea: {
              location: { type: "Point", coordinates: [city.lng, city.lat] },
              locality: city.locality,
              city: city.city,
              radiusKm: "5",
            },
            budgetRange: s.budgetRange,
          }
        : {}),
      bio: "Clean and respectful flatmate ✨",
      gender: "female",
      occupation: "working_professional",
      workSchedule: "hybrid",
      sleepSchedule: "early_bird",
      languages: ["English", "Hindi"],
      habits: HABITS,
      lookingFor: LOOKING_FOR,
      idVerified: false,
      isComplete: true,
      status: "active",
    });

    if (s.type === "have_room") {
      const rf = await RoomFlat.create({
        title: "Private room in " + city.city,
        description: "Clean room, very tidy.",
        rentAmount: String(Number(s.rent)),
        securityDeposit: String(Number(s.rent) * 2),
        roomType: "private_room",
        furnishing: "semi_furnished",
        availableFrom: "2026-11-01",
        minStayMonths: "6",
        openToSwap: true,
        petsAllowed: true,
        location: {
          country: "India",
          city: city.city,
          address: city.locality + ", " + city.city,
          sector: city.locality,
          landmark: "Quiet area",
          coordinates: city,
        },
        houseRules: {
          ownerLivesOnPremises: true,
          curfew: { hasCurfew: false, time: "" },
          oppositeGenderGuestsAllowed: "allowed_with_notice",
          overnightGuestsAllowed: "allowed",
          smokingAllowedOnPremises: false,
          drinkingAllowedOnPremises: false,
        },
        photos: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
        ],
        roommateProfile: profile._id,
        owner: user._id,
      });
      await RoommateProfile.updateOne(
        { _id: profile._id },
        { $set: { roomFlat: rf._id } },
      );
      console.log(`✅ Seeded have_room profile ${profile._id} + RoomFlat ${rf._id}`);
    } else {
      console.log(`✅ Seeded no_room profile ${profile._id}`);
    }
  }

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});