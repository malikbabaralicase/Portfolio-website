import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(dotenv_path=env_path)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
PROJECTS_FILE = os.path.join(DATA_DIR, 'projects.json')
MESSAGES_FILE = os.path.join(DATA_DIR, 'messages.json')

def load_json(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def send_contact_email(name, sender_email, message):
    """Sends the contact form submission to your inbox via Gmail SMTP."""
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print("SMTP not configured — skipping email send.")
        return False

    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = smtp_email
    msg['Reply-To'] = sender_email
    msg['Subject'] = f"New Portfolio Contact from {name}"

    body = f"""You have a new message from your portfolio contact form:

Name: {name}
Email: {sender_email}

Message:
{message}
"""
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, smtp_email, msg.as_string())
        return True
    except Exception as e:
        print("Email send error:", str(e))
        return False

@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(load_json(PROJECTS_FILE))

@app.route('/api/projects', methods=['POST'])
def add_project():
    data = request.json
    projects = load_json(PROJECTS_FILE)
    new_id = max([p.get('id', 0) for p in projects], default=0) + 1
    new_project = {
        "id": new_id,
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "problem": data.get("problem", ""),
        "solution": data.get("solution", ""),
        "tech_stack": data.get("tech_stack", ""),
        "image_url": data.get("image_url", ""),
        "github_link": data.get("github_link", ""),
        "live_link": data.get("live_link", "")
    }
    projects.append(new_project)
    save_json(PROJECTS_FILE, projects)
    return jsonify({"success": True, "project": new_project})

@app.route('/api/projects/<int:project_id>', methods=['PUT', 'DELETE'])
def manage_project(project_id):
    projects = load_json(PROJECTS_FILE)
    if request.method == 'DELETE':
        filtered = [p for p in projects if p.get('id') != project_id]
        save_json(PROJECTS_FILE, filtered)
        return jsonify({"success": True})
    elif request.method == 'PUT':
        data = request.json
        for p in projects:
            if p.get('id') == project_id:
                p.update({k: v for k, v in data.items() if k in p})
                break
        save_json(PROJECTS_FILE, projects)
        return jsonify({"success": True})

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    if not data or not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({"error": "Missing required fields"}), 400
    
    messages = load_json(MESSAGES_FILE)
    new_id = max([m.get('id', 0) for m in messages], default=0) + 1
    new_message = {
        "id": new_id,
        "name": data.get("name"),
        "email": data.get("email"),
        "message": data.get("message"),
        "created_at": __import__('datetime').datetime.now().isoformat()
    }
    messages.append(new_message)
    save_json(MESSAGES_FILE, messages)

    send_contact_email(new_message["name"], new_message["email"], new_message["message"])

    return jsonify({"success": True})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    return jsonify(load_json(MESSAGES_FILE))

@app.route('/api/messages/<int:msg_id>', methods=['DELETE'])
def delete_message(msg_id):
    messages = load_json(MESSAGES_FILE)
    filtered = [m for m in messages if m.get('id') != msg_id]
    save_json(MESSAGES_FILE, filtered)
    return jsonify({"success": True})

@app.route('/api/chat', methods=['POST'])
def chat():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY is not configured."}), 500
    
    data = request.json
    user_message = data.get("message", "")
    history = data.get("history", [])

    genai.configure(api_key=api_key)
    
    projects = load_json(PROJECTS_FILE)
    project_details = "\n".join([f"- {p.get('title')}: {p.get('description')} (Tech: {p.get('tech_stack')})" for p in projects])
    portfolio_context = f"Malik Babar Ali's Projects:\n{project_details}"

    system_instruction = f"""
    You are an advanced, friendly, and smart AI assistant integrated into Malik Babar Ali's portfolio website.

    ABOUT MALIK BABAR ALI (THE PORTFOLIO OWNER):
    - Full Name: Malik Babar Ali (often abbreviated as MBA).
    - Role: Full Stack Web Developer & Website Designer with 3+ years of experience.
    - Tagline/Focus: Transforming the Digital Future. He designs and builds modern web and mobile apps, and optimizes sites for SEO.
    - Services Offered:
      1. Website Designing: Creating visually stunning, responsive, and modern website designs (UI/UX) using Figma and custom CSS.
      2. Web Development: Building fast, scalable, and responsive web applications with React, Node.js, HTML, CSS, JavaScript, and Flask.
      3. Mobile App Development: Developing cross-platform iOS and Android apps with beautiful, native-feeling UIs.
      4. Search Engine Optimization (SEO): Enhancing site structure, loading speeds, and search rankings on Google.
      5. E-Commerce Solutions: Building robust online storefronts with payment gateways, cart flows, and backend APIs.
      6. Custom Web Applications: Designing custom digital business systems, management dashboards, and API integrations.
    - Core Skills & Competencies:
      * Web Design & Development (HTML, CSS, JavaScript) (95% expertise)
      * React & Next.js Frontend Development (93% expertise)
      * Node.js & Flask Backend Development (90% expertise)
      * Mobile App Development (React Native) (88% expertise)
      * Search Engine Optimization (SEO) (87% expertise)
      * Database & Cloud Deployment (SQL, PostgreSQL, AWS, Git) (82% expertise)
    - Contact Information:
      * Email: malikbabarali520@gmail.com
      * Phone: +92 323 012 4225
      * Instagram: https://www.instagram.com/malikbabarali.5/
      * LinkedIn: https://www.linkedin.com/in/malik-babar-ali-9a5165347/
      * GitHub: https://github.com/malikbabaralicase
      * Fiverr: Available for freelance projects!

    TECHNICAL INSTRUCTION & TRAINING:
    - You must be extremely knowledgeable in all areas of Computer Science, Software Engineering, Web Design, Web Development, Mobile Development, and SEO.
    - You can answer advanced questions about JavaScript, HTML/CSS, React, Next.js, Node.js, Flask/Python, databases, SEO optimization, and web performance optimization.
    - When asked technical questions, provide clear, precise, and educational answers. Use clean code blocks with proper formatting when writing code.

    RULES:
    - If the user asks about Malik Babar Ali, his skills, contact details, or experience, refer to the details above and provide a complete, direct, and warm response.
    - If the user asks technical or coding questions, act as an expert AI tutor and programming assistant. Provide clear, accurate, and complete code snippets if relevant.
    - Keep responses professional, helpful, and nicely structured using markdown (e.g. lists, bold text, code blocks) which will be parsed as HTML.
    - Never mention that you are a language model or have constraints. Speak confidently as Malik's AI representative and a tech expert.

    Current Projects in Malik's Portfolio:
    {portfolio_context}
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)
        
        formatted_history = []
        for msg in history:
            role = 'user' if msg.get('role') == 'user' else 'model'
            formatted_history.append({'role': role, 'parts': [msg.get('content')]})
            
        chat_session = model.start_chat(history=formatted_history)
        response = chat_session.send_message(user_message)
        
        return jsonify({"reply": response.text})
    except Exception as e:
        print("Chat API Error:", str(e))
        return jsonify({"error": "Failed to process chat request."}), 500

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/admin')
def serve_admin():
    return send_from_directory(FRONTEND_DIR, 'admin.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)

if __name__ == '__main__':
    print('Portfolio running at http://localhost:5000')
    print('Admin panel at http://localhost:5000/admin.html')
    app.run(debug=True, port=5000)
