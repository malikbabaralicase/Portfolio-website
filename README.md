# Malik Babar Ali - Portfolio Website

A lightweight personal portfolio built with **HTML, CSS, JavaScript** on the frontend, and a single **Vercel serverless function** on the backend that powers the contact form (sends email via SMTP — nothing is saved to a database).

## Features

- **Static & fast**: Pure HTML/CSS/JS frontend, no build step required.
- **Beautiful UI**: Glassmorphism design system with TailwindCSS.
- **Projects section**: Hardcoded directly in `frontend/js/main.js` — edit that array to add/update/remove projects.
- **Contact form**: Submits to `/api/contact`, which sends you an email via Gmail SMTP (no database, no saved messages).

## Project Structure

```text
own-website/
├── api/
│   └── contact.js         # Vercel serverless function — sends contact form emails via SMTP
├── frontend/
│   ├── css/
│   │   └── style.css      # Styles and animations
│   ├── js/
│   │   ├── main.js        # Interactions, hardcoded projects, contact form logic
│   │   ├── tailwind-config.js
│   │   ├── three-hero.js
│   │   ├── scroll-3d.js
│   │   ├── scene-detect.js
│   │   └── tilt-cards.js
│   ├── images/
│   └── index.html
├── vercel.json             # Routes static frontend + the serverless function
├── package.json            # Just needs nodemailer
├── .env.local.example      # Template for SMTP credentials
└── README.md
```

## Running Locally

Vercel provides a CLI that runs your serverless functions locally, matching production exactly:

```bash
npm install -g vercel
npm install
vercel dev
```

Then open the local URL it prints (usually `http://localhost:3000`).

## Deploying to Vercel

1. Push this project to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. In your Vercel project settings, add environment variables:
   - `SMTP_EMAIL`
   - `SMTP_PASSWORD` (a Gmail App Password, not your regular password)
4. Deploy. Vercel will automatically serve `frontend/` as static files and run `api/contact.js` as a serverless function whenever the contact form is submitted.

## Environment Variables

Copy `.env.local.example` to `.env.local` for local reference (not used directly by Vercel in production — set the same values in the Vercel dashboard instead):

```
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```
