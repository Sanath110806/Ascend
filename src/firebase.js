import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// YouTube Data API Key
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// ============ SAMPLE DATA ============

const sampleClassrooms = [
  {
    id: "class1",
    subject: "CS 101 - Introduction to Programming",
    teacherId: "teacher1",
    teacherName: "Dr. Sarah Johnson",
    teacherEmail: "sarah.johnson@university.edu",
    announcements: [
      "Assignment 3 due date extended to Friday",
      "Office hours moved to 2-4 PM on Wednesdays",
      "Midterm exam will cover chapters 1-5"
    ],
    assignments: [
      { id: "a1", title: "Variables and Data Types", description: "Complete exercises 1-10 from Chapter 2", dueDate: "2026-01-25" },
      { id: "a2", title: "Control Flow Statements", description: "Write a program using if/else and loops", dueDate: "2026-02-01" }
    ],
    referenceNotes: [
      { id: "n1", title: "Python Basics Cheat Sheet", content: "Variables: Use = to assign values.\nData Types: int, float, str, bool, list, dict\nPrint: print('Hello World')\nInput: name = input('Enter name: ')" },
      { id: "n2", title: "Control Flow Reference", content: "If Statement:\nif condition:\n    code\nelif other:\n    code\nelse:\n    code\n\nFor Loop:\nfor i in range(10):\n    print(i)" }
    ]
  },
  {
    id: "class2",
    subject: "MATH 201 - Discrete Mathematics",
    teacherId: "teacher2",
    teacherName: "Prof. Michael Chen",
    teacherEmail: "m.chen@university.edu",
    announcements: [
      "Quiz 2 results posted on portal",
      "Study group sessions available in Library Room 204"
    ],
    assignments: [
      { id: "a1", title: "Set Theory Problems", description: "Problems 1-15 from Section 2.3", dueDate: "2026-01-28" },
      { id: "a2", title: "Logic and Proofs", description: "Prove theorems 3.1-3.5", dueDate: "2026-02-05" }
    ],
    referenceNotes: [
      { id: "n1", title: "Set Theory Formulas", content: "Union: A ∪ B\nIntersection: A ∩ B\nComplement: A'\nDifference: A - B\nSubset: A ⊆ B" }
    ]
  },
  {
    id: "class3",
    subject: "ENG 102 - Technical Writing",
    teacherId: "teacher3",
    teacherName: "Dr. Emily Parker",
    teacherEmail: "e.parker@university.edu",
    announcements: [
      "Peer review workshop next Tuesday",
      "Final project topic proposals due soon"
    ],
    assignments: [
      { id: "a1", title: "Research Paper Draft", description: "Submit first draft of research paper (min 2000 words)", dueDate: "2026-01-30" }
    ],
    referenceNotes: [
      { id: "n1", title: "Citation Guidelines", content: "APA Format:\nAuthor, A. A. (Year). Title of work. Publisher.\n\nIn-text: (Author, Year)\n\nMLA Format:\nAuthor. \"Title.\" Container, Year, pp. Pages." }
    ]
  }
];

// ============ SEED DATA ============

export async function seedSampleData() {
  try {
    const classroomsSnapshot = await getDocs(collection(db, "classrooms"));
    if (!classroomsSnapshot.empty) {
      console.log("Sample data already exists");
      return;
    }

    for (const classroom of sampleClassrooms) {
      await setDoc(doc(db, "classrooms", classroom.id), classroom);
    }

    console.log("Sample data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

// ============ USER MANAGEMENT ============

export async function getOrCreateUser(user) {
  try {
    if (!user || !user.uid) {
      console.error("Invalid user object");
      return "student";
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user but preserve role
      const existingData = userDoc.data();
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || existingData.name || "User",
        email: user.email,
        photoURL: user.photoURL,
        role: existingData.role || "student",
        lastLogin: serverTimestamp()
      }, { merge: true });
      return existingData.role || "student";
    } else {
      // Create new user as student by default
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,
        photoURL: user.photoURL,
        role: "student",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      console.log("New user created:", user.uid);
      return "student";
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return "student";
  }
}

export async function getUserRole(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().role || "student";
    }
    return "student";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "student";
  }
}

export async function setUserRole(userId, role) {
  try {
    await setDoc(doc(db, "users", userId), { role }, { merge: true });
  } catch (error) {
    console.error("Error setting user role:", error);
  }
}

// Get teacher's classrooms
export async function getTeacherClassrooms(teacherId) {
  try {
    const q = query(collection(db, "classrooms"), where("teacherId", "==", teacherId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting teacher classrooms:", error);
    return [];
  }
}

// Create a new classroom
export async function createClassroom(teacherId, teacherName, teacherEmail, subject) {
  try {
    const classroomId = `class_${Date.now()}`;
    const classroomData = {
      id: classroomId,
      subject,
      teacherId,
      teacherName,
      teacherEmail,
      students: [],
      announcements: [],
      assignments: [],
      referenceNotes: [],
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, "classrooms", classroomId), classroomData);
    return classroomData;
  } catch (error) {
    console.error("Error creating classroom:", error);
    return null;
  }
}

// Add student to classroom
export async function addStudentToClassroom(classroomId, studentId, studentName, studentEmail) {
  try {
    const classroom = await getClassroom(classroomId);
    if (!classroom) return;

    const students = classroom.students || [];
    if (students.some(s => s.id === studentId)) return; // Already enrolled

    students.push({
      id: studentId,
      name: studentName,
      email: studentEmail,
      joinedAt: new Date().toISOString()
    });

    await setDoc(doc(db, "classrooms", classroomId), { students }, { merge: true });
  } catch (error) {
    console.error("Error adding student:", error);
  }
}

// Get classroom students
export async function getClassroomStudents(classroomId) {
  try {
    const classroom = await getClassroom(classroomId);
    return classroom?.students || [];
  } catch (error) {
    console.error("Error getting students:", error);
    return [];
  }
}

// ============ YOUTUBE PLAYLIST ============

export function extractPlaylistId(url) {
  const regex = /[?&]list=([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function fetchPlaylistVideos(playlistId) {
  if (YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY") {
    // Return mock data if no API key
    return {
      title: "Sample Playlist",
      videos: [
        { id: "dQw4w9WgXcQ", title: "Sample Video 1", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg" },
        { id: "9bZkp7q19f0", title: "Sample Video 2", thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg" },
        { id: "kJQP7kiw5Fk", title: "Sample Video 3", thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg" }
      ]
    };
  }

  try {
    // Fetch playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistResponse.json();
    const playlistTitle = playlistData.items?.[0]?.snippet?.title || "Untitled Playlist";

    // Fetch playlist items
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    const videos = videosData.items?.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
    })) || [];

    return { title: playlistTitle, videos };
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw new Error("Failed to fetch playlist. Check your API key.");
  }
}

// ============ STUDENT COURSES ============

export async function createStudentCourse(userId, playlistUrl) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error("Invalid playlist URL");
  }

  const { title, videos } = await fetchPlaylistVideos(playlistId);

  const courseId = `${userId}_${playlistId}`;
  const courseData = {
    id: courseId,
    userId: userId,
    playlistId,
    title,
    videos,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, "studentCourses", courseId), courseData);
  console.log("Course created:", courseId, "for user:", userId);
  return courseData;
}

export async function getStudentCourses(userId) {
  try {
    const q = query(collection(db, "studentCourses"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting student courses:", error);
    return [];
  }
}

export async function getStudentCourse(courseId) {
  try {
    const docRef = doc(db, "studentCourses", courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting course:", error);
    return null;
  }
}

export async function deleteStudentCourse(courseId) {
  try {
    await deleteDoc(doc(db, "studentCourses", courseId));
  } catch (error) {
    console.error("Error deleting course:", error);
  }
}

// ============ VIDEO PROGRESS ============

export async function getVideoProgress(userId, courseId) {
  try {
    const progressId = `${userId}_${courseId}`;
    const docRef = doc(db, "videoProgress", progressId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().completedVideos || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting video progress:", error);
    return [];
  }
}

export async function updateVideoProgress(userId, courseId, videoId, completed) {
  try {
    const progressId = `${userId}_${courseId}`;
    const docRef = doc(db, "videoProgress", progressId);

    const currentProgress = await getVideoProgress(userId, courseId);
    let completedVideos = [...currentProgress];

    if (completed && !completedVideos.includes(videoId)) {
      completedVideos.push(videoId);
    } else if (!completed) {
      completedVideos = completedVideos.filter(id => id !== videoId);
    }

    await setDoc(docRef, {
      userId,
      courseId,
      completedVideos,
      updatedAt: serverTimestamp()
    });

    return completedVideos;
  } catch (error) {
    console.error("Error updating progress:", error);
    return [];
  }
}

// ============ STUDENT NOTES ============

export async function getStudentNote(userId, courseId, videoId) {
  try {
    const noteId = `${userId}_${courseId}_${videoId}`;
    const docRef = doc(db, "studentNotes", noteId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().content || "";
    }
    return "";
  } catch (error) {
    console.error("Error getting note:", error);
    return "";
  }
}

export async function saveStudentNote(userId, courseId, videoId, content) {
  try {
    const noteId = `${userId}_${courseId}_${videoId}`;
    await setDoc(doc(db, "studentNotes", noteId), {
      userId,
      courseId,
      videoId,
      content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

// ============ CLASSROOMS ============

export async function getClassrooms() {
  try {
    const snapshot = await getDocs(collection(db, "classrooms"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting classrooms:", error);
    return [];
  }
}

export async function getClassroom(classroomId) {
  try {
    const docRef = doc(db, "classrooms", classroomId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting classroom:", error);
    return null;
  }
}

// ============ TEACHER FUNCTIONS ============

export async function addAnnouncement(classroomId, announcement) {
  try {
    const classroom = await getClassroom(classroomId);
    if (!classroom) return;

    const announcements = [announcement, ...(classroom.announcements || [])];
    await setDoc(doc(db, "classrooms", classroomId), { announcements }, { merge: true });

    // Notify students
    await notifyClassroomStudents(classroomId, "New Announcement", announcement.substring(0, 50) + (announcement.length > 50 ? '...' : ''));
  } catch (error) {
    console.error("Error adding announcement:", error);
  }
}

export async function addAssignment(classroomId, assignment) {
  try {
    const classroom = await getClassroom(classroomId);
    if (!classroom) return;

    const newAssignment = { id: `a${Date.now()}`, ...assignment };
    const assignments = [...(classroom.assignments || []), newAssignment];
    await setDoc(doc(db, "classrooms", classroomId), { assignments }, { merge: true });

    // Notify students
    await notifyClassroomStudents(classroomId, "New Assignment", `${assignment.title} - Due: ${assignment.dueDate}`);
  } catch (error) {
    console.error("Error adding assignment:", error);
  }
}

export async function addReferenceNote(classroomId, note) {
  try {
    const classroom = await getClassroom(classroomId);
    if (!classroom) return;

    const newNote = { id: `n${Date.now()}`, ...note };
    const referenceNotes = [...(classroom.referenceNotes || []), newNote];
    await setDoc(doc(db, "classrooms", classroomId), { referenceNotes }, { merge: true });

    // Notify students
    await notifyClassroomStudents(classroomId, "New Reference Note", `${note.title} has been added`);
  } catch (error) {
    console.error("Error adding reference note:", error);
  }
}

// ============ NOTIFICATIONS ============

export async function createNotification(userId, title, message) {
  try {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, "notifications", notificationId), {
      id: notificationId,
      userId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function notifyClassroomStudents(classroomId, title, message) {
  try {
    const classroom = await getClassroom(classroomId);
    if (!classroom || !classroom.students) return;

    for (const student of classroom.students) {
      await createNotification(student.id, title, message);
    }
  } catch (error) {
    console.error("Error notifying students:", error);
  }
}

export async function getUserNotifications(userId) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by createdAt (newest first)
    return notifications.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
}

export async function markNotificationRead(notificationId) {
  try {
    await setDoc(doc(db, "notifications", notificationId), { read: true }, { merge: true });
  } catch (error) {
    console.error("Error marking notification read:", error);
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    const notifications = await getUserNotifications(userId);
    for (const notif of notifications) {
      if (!notif.read) {
        await markNotificationRead(notif.id);
      }
    }
  } catch (error) {
    console.error("Error marking all read:", error);
  }
}

// ============ ACTIVITY LOGGING ============

export async function logVideoWatch(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const activityId = `${userId}_${today}`;
    const activityRef = doc(db, "activityLogs", activityId);

    const existing = await getDoc(activityRef);
    let count = 1;

    if (existing.exists()) {
      count = (existing.data().count || 0) + 1;
    }

    await setDoc(activityRef, {
      userId,
      date: today,
      count,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export async function getUserActivityLogs(userId) {
  try {
    const q = query(
      collection(db, "activityLogs"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const logs = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      logs[data.date] = data.count || 0;
    });

    return logs;
  } catch (error) {
    console.error("Error getting activity logs:", error);
    return {};
  }
}

// ============ PROFILE UPDATE ============

export async function updateUserName(userId, newName) {
  try {
    await setDoc(doc(db, "users", userId), { name: newName }, { merge: true });
  } catch (error) {
    console.error("Error updating name:", error);
  }
}
