# Wedding_Invitation
A beautiful, responsive website for Eric & Aziza's 25th Silver Anniversary celebration with RSVP functionality and admin dashboard.

🌟 Features
Main Website
Elegant Design: Gold and silver themed design with elegant animations

Responsive Layout: Works perfectly on desktop, tablet, and mobile devices

Interactive Elements:

Photo slider with touch support

Countdown timer to the anniversary date

Memory timeline with interactive tree

Love meter animation

Floating hearts and particle effects

RSVP System: Secure form with validation and confirmation

Photo Gallery: Lightbox-enabled image gallery

Music Player: Background music toggle

Admin Dashboard
Real-time Statistics: Live updates of RSVP responses

Guest Management: View, search, and filter RSVPs

Data Export: Export to CSV and JSON formats

Password Protection: Secure access to dashboard

Responsive Design: Works on all devices

🚀 Quick Start
Option 1: Frontend Only (No Backend)
Download all files to a folder

Open index.html in your web browser

The website will work with localStorage fallback for RSVPs

Option 2: Full Stack with Backend
Prerequisites
Node.js (v14 or higher)

MongoDB (local or cloud instance)

Installation Steps
Clone or download the project files

bash
# Create project directory
mkdir silver-anniversary
cd silver-anniversary
Set up the file structure



bash
cd server
npm install
Configure environment variables
Create server/.env file:

env
MONGODB_URI=mongodb://localhost:27017/silver_anniversary
PORT=3000
Start MongoDB



# MongoDB Atlas cloud service
Start the server

bash
cd server
nodemond: npm install
npm start
Access the application

Main Website: http://localhost:3000

Dashboard: http://localhost:3000/dashboard.html

Dashboard Password: Aziza@Eric25An


🛠️ Technical Details
Frontend Technologies
HTML5: Semantic markup

CSS3: Custom properties, Grid, Flexbox, Animations

JavaScript ES6+: Modular classes, Fetch API, Async/Await

Libraries:

W3.CSS for utility classes

Font Awesome for icons

Google Fonts (Playfair Display, Poppins, Dancing Script)

Animate.css for animations

Backend Technologies
Node.js: Runtime environment

Express.js: Web framework

MongoDB: Database for RSVP storage

Mongoose: ODM for MongoDB

CORS: Cross-origin resource sharing



🔧 Configuration
Customizing the Website
Update Anniversary Details

Edit index.html to change names, dates, and locations

Update countdown timer in js/components.js

Modify Styling

Edit CSS variables in styles/main.css

Update color scheme in :root selector

Change Images

Replace Unsplash image URLs with your own photos

Update image paths in HTML and CSS

Customize Password

Change dashboard password in js/components.js

