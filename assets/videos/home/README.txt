===========================================================
 CHAROEN ON CUP — Homepage Video Static Files Directory
===========================================================

Place your video files and poster images in this folder.
After placing files, update the Video Path and Poster Path
in the Admin CMS, then deploy the website.

-----------------------------------------------------------
SUPPORTED VIDEO FORMATS
-----------------------------------------------------------
- MP4  (.mp4)  — Recommended. H.264 + AAC codec.
- WebM (.webm) — Alternative. VP9 + Opus codec.

-----------------------------------------------------------
RECOMMENDED VIDEO SETTINGS
-----------------------------------------------------------
- Codec    : H.264 (video) + AAC (audio) for MP4
- Resolution: 1280×720 (HD) or 1920×1080 (Full HD)
- Length   : 30–60 seconds
- File Size: 5–15 MB (soft limit)
- Maximum  : 20 MB per file

-----------------------------------------------------------
POSTER / THUMBNAIL IMAGE
-----------------------------------------------------------
- Format   : WebP (preferred), JPEG, or PNG
- Resolution: 1280×720 (match video resolution)
- File Size: Under 200 KB

-----------------------------------------------------------
FILENAME CONVENTIONS
-----------------------------------------------------------
- Use lowercase English letters only
- Use hyphens (-) instead of spaces or underscores
- Do NOT use spaces, Thai characters, or special symbols
- Examples:
    home-video-01.mp4
    home-video-01.webp
    factory-process-01.mp4
    factory-process-01.webp

-----------------------------------------------------------
EXAMPLE DIRECTORY STRUCTURE
-----------------------------------------------------------
assets/
└── videos/
    └── home/
        ├── README.txt              ← this file
        ├── home-video-01.mp4
        ├── home-video-01.webp
        ├── home-video-02.mp4
        └── home-video-02.webp

-----------------------------------------------------------
ADMIN CMS USAGE
-----------------------------------------------------------
1. Place your MP4 file in this folder.
2. Place the matching WebP poster in this folder.
3. Open Admin CMS → Homepage Videos.
4. Click "แก้ไขคลิป" for the video slot.
5. Enter the Video Path:
     assets/videos/home/your-video-name.mp4
6. Enter the Poster Path:
     assets/videos/home/your-video-name.webp
7. Save.
8. Deploy the website (re-upload all files including this folder).

-----------------------------------------------------------
IMPORTANT NOTES
-----------------------------------------------------------
- Changing or adding a video file REQUIRES a new deployment.
- Videos placed here will be visible to ALL visitors after deploy.
- Videos are NOT stored in Firebase or any cloud service.
- Videos are served as static files alongside the website HTML.
- Videos stored locally in your browser (IndexedDB) from the
  old system will NOT be visible on other devices.

-----------------------------------------------------------
DO NOT
-----------------------------------------------------------
- Do NOT use absolute Windows paths (e.g. C:\Users\...)
- Do NOT use URLs starting with file://
- Do NOT use paths with ../ (path traversal)
- Do NOT upload binary files directly through the CMS editor
===========================================================
