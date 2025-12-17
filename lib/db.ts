// lib/db.ts
import { db } from "./firebase"; 
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

// 1. Create User Profile if it doesn't exist (We call this when they log in)
export const createUserProfile = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // New User! Create their default profile in the database
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email,
      photoURL: user.photoURL,
      plan: "Free Starter",
      status: "Active",
      memberSince: serverTimestamp(),
      toolsUsedCount: 0,
      toolsUsage: {
        popupBuilder: 0,
        policyGenerator: 0,
        roiCalculator: 0
      }
    });
  }
};

// 2. Track Tool Usage (We call this when they click a tool)
export const trackToolUsage = async (userId: string, toolKey: string) => {
  if (!userId) return;
  
  const userRef = doc(db, "users", userId);
  
  try {
    await updateDoc(userRef, {
      toolsUsedCount: increment(1), // Adds 1 to total count
      [`toolsUsage.${toolKey}`]: increment(1), // Adds 1 to specific tool count
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error("Error tracking usage:", error);
  }
};