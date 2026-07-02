# Malik Babar Ali - Portfolio Website

This is the completely simplified, lightweight version of my portfolio, built using **HTML, CSS, JavaScript**, and a **Python (Flask)** backend. It preserves the beautiful original design and animations without the overhead of Next.js or a complex database.

## 🚀 Features

- **Blazing Fast**: Pure static HTML/CSS/JS frontend served locally.
- **Beautiful UI**: Modern glassmorphism design with TailwindCSS.
- **AI Chat Assistant**: Integrated directly into the Flask backend using Google Gemini.
- **Admin Dashboard**: Full CRUD for projects and messages via simple JSON files (no SQL database needed).
- **Zero Config**: No complex Node.js build steps or Webpack setups.

---

## 📂 Project Structure

```text
own-website/
├── backend/
│   ├── data/
│   │   ├── projects.json       # Your mock database for projects
│   │   └── messages.json       # Your mock database for messages
│   ├── app.py                  # The Flask Server (handles APIs & AI)
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── css/
│   │   └── style.css           # Custom animations and variables
│   ├── js/
│   │   ├── main.js             # Interactions and fetching logic
│   │   ├── chat.js             # Chat assistant logic
│   │   ├── admin.js            # Admin panel logic
│   │   └── tailwind-config.js  # CDN Tailwind configuration
│   ├── index.html              # The main portfolio
│   └── admin.html              # The admin dashboard
├── .env.local                  # Environment variables (GEMINI_API_KEY)
└── README.md                   # This file
```

---

## 🛠️ How to Run

### 1. Set up the Backend (Flask)
1. Open a terminal in the `backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Make sure your `GEMINI_API_KEY` is inside the `.env.local` file at the root. (It is already read by the Flask app automatically).
4. Run the backend server:
   ```bash
   python app.py
   ```
   *The server will start on `http://localhost:5000` and serves both the API and the frontend.*

### 2. View the Frontend
**Recommended:** Open [http://localhost:5000](http://localhost:5000) after starting Flask — this serves the site and API from one origin (no CORS issues).

Alternatively, you can open `frontend/index.html` directly or use a static server:
   ```bash
   python -m http.server 3000 -d frontend
   ```
   *(When using a separate static server, the backend must still run on port 5000 for projects, contact form, and chat.)*

### 3. Access the Admin Panel
- Open `frontend/admin.html` in your browser.
- Here you can Add/Edit/Delete your projects, and view Contact Form messages. All data is saved automatically to the `backend/data/` JSON files!

---

## 🎨 Modifying Content
- **Text & About Info**: Edit `frontend/index.html` directly.
- **Projects**: Use the Admin Panel (`frontend/admin.html`) to manage projects easily.
- **Styles**: Modify `frontend/css/style.css` for custom animations, or edit the Tailwind classes in the HTML.
