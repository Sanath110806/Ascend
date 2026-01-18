# Ascend

A modern learning platform for students and teachers.

![Ascend](public/favicon.png)

## Live Demo

**[https://ascend-learning-five.vercel.app](https://ascend-learning-five.vercel.app)**

## Features

### For Students
- Add YouTube playlists as personal courses
- Track video progress with completion checkboxes
- Take notes per video with auto-save
- View learning activity heatmap
- Join teacher classrooms
- Receive notifications for new assignments

### For Teachers
- Create and manage classrooms
- Post announcements
- Upload assignments with due dates
- Add reference notes for students
- View enrolled student list

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite |
| Styling | Vanilla CSS |
| Backend | Firebase |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Cloud Firestore |
| API | YouTube Data API v3 |
| Hosting | Vercel |

## Project Structure

```
src/
├── components/
│   ├── ActivityHeatmap.jsx
│   ├── AddPlaylist.jsx
│   ├── Navbar.jsx
│   ├── NotificationBell.jsx
│   ├── StudentNotes.jsx
│   ├── TeacherPanel.jsx
│   └── ...
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Courses.jsx
│   ├── MyCoursePlayer.jsx
│   ├── Classrooms.jsx
│   ├── ClassroomDetail.jsx
│   ├── Profile.jsx
│   └── Settings.jsx
├── firebase.js
├── App.jsx
└── index.css
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- YouTube Data API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Sanath110806/Ascend.git

# Navigate to directory
cd Ascend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Firebase config and YouTube API key
3. For Vercel deployment, add the same variables in Project Settings > Environment Variables

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| users | User profiles and roles |
| classrooms | Teacher classrooms |
| studentCourses | YouTube playlist courses |
| videoProgress | Video completion tracking |
| studentNotes | Per-video notes |
| activityLogs | Daily learning activity |
| notifications | User notifications |

## License

MIT
