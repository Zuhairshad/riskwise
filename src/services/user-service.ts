
import { db } from '@/lib/firebase';
import type { UserProfile, Badge } from '@/lib/types';
import { getBadgeById } from '@/lib/badges';
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
// Removed all Firebase Auth imports


// Fetch all users from Firestore and sort by score for the leaderboard
export async function getUsers(): Promise<UserProfile[]> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('score', 'desc'));
    const userSnapshot = await getDocs(q);
    
    const users: UserProfile[] = userSnapshot.docs.map(doc => {
        const data = doc.data();
        const badges = (data.badges || []).map((badgeId: string) => getBadgeById(badgeId)).filter(Boolean) as Badge[];
        return {
            id: doc.id,
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            title: data.title,
            score: data.score,
            badges: badges,
        };
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Fetch a single user profile from Firestore by UID
export async function getUser(userId: string): Promise<UserProfile | undefined> {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return undefined;
        }

        const data = userDoc.data();
        const badges = (data.badges || []).map((badgeId: string) => getBadgeById(badgeId)).filter(Boolean) as Badge[];

        return {
            id: userDoc.id,
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            title: data.title,
            score: data.score,
            badges: badges,
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return undefined;
    }
}

// Get the currently logged-in user's profile from Firestore.
// THIS FUNCTION IS NOW MOCKED as auth is removed. It will return the first user.
export async function getCurrentUser(): Promise<UserProfile | undefined> {
    const allUsers = await getUsers();
    return allUsers[0];
}
