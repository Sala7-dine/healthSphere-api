# 🏥 HealthSphere – Backend API

API REST développée avec **Express.js** et **MongoDB (Mongoose)** pour l’application mobile HealthSphere V2.

---

## 📌 Description

Cette API permet de :

* Récupérer un catalogue d’exercices
* Consulter le détail d’un exercice
* Ajouter un exercice en favoris
* Supprimer un favori
* Gérer les données nécessaires au fonctionnement offline-first de l’application mobile

L’API est conçue avec une architecture modulaire, scalable et maintenable.

---

## 🛠 Stack Technique

* Node.js
* Express.js
* MongoDB
* Mongoose
* dotenv
* cors
* nodemon (dev)

---

## 📂 Architecture du projet

```
backend/
│
├── src/
│   ├── config/
│   │     └── db.js
│   ├── controllers/
│   │     ├── exercise.controller.js
│   │     └── favorite.controller.js
│   ├── models/
│   │     ├── Exercise.js
│   │     └── Favorite.js
│   ├── routes/
│   │     ├── exercise.routes.js
│   │     └── favorite.routes.js
│   ├── services/
│   ├── middleware/
│   └── app.js
│
├── server.js
├── .env
├── package.json
└── README.md
```

---

## 🗄 Modèles de données

### 🔹 Exercise

```json
{
  "name": "Push-ups",
  "category": "Strength",
  "difficulty": "Beginner",
  "description": "Exercise description",
  "duration": 10
}
```

### 🔹 Favorite

```json
{
  "exerciseId": "ObjectId",
  "createdAt": "Date"
}
```

---

## 🔌 Endpoints API

### 📘 Exercises

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| GET    | /api/exercises     | Récupérer tous les exercices |
| GET    | /api/exercises/:id | Récupérer un exercice par ID |
| POST   | /api/exercises     | Ajouter un exercice (admin)  |
| PUT    | /api/exercises/:id | Modifier un exercice         |
| DELETE | /api/exercises/:id | Supprimer un exercice        |

---

### ⭐ Favorites

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | /api/favorites     | Récupérer les favoris |
| POST   | /api/favorites     | Ajouter aux favoris   |
| DELETE | /api/favorites/:id | Supprimer un favori   |

---

## ⚙ Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/your-repo/healthsphere-backend.git
cd backend
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configuration environnement

Créer un fichier `.env` :

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/healthsphere
```

### 4️⃣ Lancer le serveur

```bash
npm run dev
```

Serveur disponible sur :

```
http://localhost:5000
```

---

## 🔐 Gestion des erreurs

* Middleware global error handler
* Validation des ObjectId
* Réponses structurées :

```json
{
  "success": false,
  "message": "Exercise not found"
}
```

---

## 🌐 Stratégie pour le Mobile (Offline-First)

L’API est conçue pour :

* Fournir des données simples et légères
* Permettre la synchronisation côté mobile
* Être tolérante aux erreurs réseau
* Retourner des codes HTTP propres (200, 201, 400, 404, 500)

La gestion offline est principalement gérée côté mobile via AsyncStorage.

---

## 🔄 Scripts disponibles

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

