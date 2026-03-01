import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      age,
      phone,
      email,
      language,
      state,
      occupation,
      gender,
      caste,
    } = body;

    if (!name || !phone || !age) {
      return NextResponse.json(
        { message: "Please fill in all required fields (Name, Age, Phone)." },
        { status: 400 },
      );
    }

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 85) {
      return NextResponse.json(
        { message: "Please provide a valid age between 18 and 85." },
        { status: 400 },
      );
    }

    // Indian mobile number validation (mirrors frontend regex)
    // VOICE- prefixed IDs are auto-generated for voice-onboarded users —
    // they never speak a phone number so we allow the placeholder through.
    const INDIAN_PHONE_REGEX = /^([6-9]|160|140)\d{7,9}$/;
    const isVoiceUser = phone.trim().startsWith("VOICE-");
    if (!isVoiceUser && !INDIAN_PHONE_REGEX.test(phone.trim())) {
      return NextResponse.json(
        { message: "Please provide a valid Indian mobile number." },
        { status: 400 },
      );
    }

    if (!state) {
      return NextResponse.json(
        { message: "State is required." },
        { status: 400 },
      );
    }

    if (!caste) {
      return NextResponse.json(
        { message: "Caste / Category is required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("LaxmiAI");
    const usersCollection = db.collection("users");

    let userCategory = "General";
    if (parsedAge < 25) userCategory = "Youth";
    else if (parsedAge >= 60) userCategory = "Senior Citizen";

    const userData = {
      name: name.trim(),
      age: parsedAge,
      phone: phone.trim(),
      email: email || "",
      language: language || "English",
      state,
      occupation: occupation || "General",
      gender: gender || "Other",
      caste: caste || "General", // ← new field
      category: userCategory,
      updatedAt: new Date(),
    };

    await usersCollection.updateOne(
      { phone: phone.trim() },
      { $set: userData },
      { upsert: true },
    );

    console.log("✅ User Saved to MongoDB:", userData.phone);

    return NextResponse.json(
      { message: "Login Successful", user: userData },
      { status: 200 },
    );
  } catch (error) {
    console.error("CRITICAL ERROR in Onboarding Route:", error);
    return NextResponse.json(
      { message: "Server error occurred. Please try again." },
      { status: 500 },
    );
  }
}
