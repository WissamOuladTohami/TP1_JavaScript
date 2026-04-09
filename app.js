require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Router users
const usersRouter = express.Router();

usersRouter.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(JSON.parse(data));
  });
});

usersRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    const users = JSON.parse(data);
    const user = users.find(u => u.id === id);

    user ? res.json(user) : res.status(404).json({ error: 'Utilisateur non trouvé' });
  });
});

usersRouter.post('/', (req, res) => {
  const newUser = req.body;

  if (!newUser.nom || !newUser.prenom) {
    return res.status(400).json({ error: 'Nom et prénom sont requis' });
  }

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    const users = JSON.parse(data);
    const maxId = Math.max(...users.map(u => u.id), 0);

    newUser.id = maxId + 1;
    users.push(newUser);

    fs.writeFile(
      path.join(__dirname, 'users.json'),
      JSON.stringify(users, null, 2),
      err => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(201).json(newUser);
      }
    );
  });
});

app.use('/api/users', usersRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Start
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});