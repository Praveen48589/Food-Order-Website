<<<<<<< HEAD
# BiteRush Plus - Food Order Website

BiteRush Plus is a full-stack food ordering web application built with a static frontend and a Node.js backend. Users can log in, browse food items, add products to cart, buy items directly, update their profile, upload a profile photo, and view order history.

## Features

- Login-first user experience
- Professional food-themed UI
- Profile photo upload with preview
- My Account drawer for personal details and updates
- Food category filtering and search
- Add to cart flow
- Buy Now flow with delivery details form
- Cart drawer with checkout form
- Orders drawer showing all placed orders
- Local JSON-based order storage
- Dependency-light Node.js backend

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js HTTP server
- JSON file storage

## Project Structure

```text
fullstack-food-order/
  backend/
    server.js
    package.json
  frontend/
    index.html
    styles.css
    app.js
  mongodb/
    seed/
      orders.json
  package.json
  README.md
```

## Run Locally

Clone the repository and open the project folder:

```powershell
cd fullstack-food-order
```

Start the app:

```powershell
npm start
```

Open in your browser:

```text
http://localhost:3000
```

## Run In Background On Windows

```powershell
Start-Process -FilePath node -ArgumentList "backend/server.js" -WindowStyle Hidden
```

Stop the background server:

```powershell
Get-Process node | Stop-Process
```

## API Endpoints

```text
GET  /api/menu
GET  /api/orders
POST /api/orders
```

## Notes

- User profile data is stored in browser `localStorage`.
- Orders are saved locally in `mongodb/seed/orders.json`.
- This project is designed for learning full-stack basics without heavy frameworks.

## Author

Praveen
=======
# DEV-SEC-OPS
End to End dev-sec-ops pipeline
>>>>>>> 7f7d6d5b8f33f96910622509a6ca20b072b40a28
