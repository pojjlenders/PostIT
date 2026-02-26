const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Configurazione EJS e Body Parser
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = 'post.json';

// --- ROTTE ---

// 1. Pagina del Form
app.get('/post', (req, res) => {
    // Cerca automaticamente in /views/index.ejs
    res.render('index'); 
});

// 2. Salvataggio nel JSON
app.post('/post', (req, res) => {
    const { title, description, imageUrl, extraInfo } = req.body;

    const newPost = {
        id: Date.now().toString(), // ID univoco basato sul tempo
        title,
        description,
        imageUrl,
        extraInfo,
        createdAt: new Date().toLocaleString()
    };

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        const posts = err ? [] : JSON.parse(data);
        posts.push(newPost);

        fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Errore nel salvataggio");
            // Dopo il salvataggio, reindirizziamo alla gallery
            res.redirect('/postGallery');
        });
    });
});

// 3. Gallery (Tutti i post)
app.get('/postGallery', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        const posts = err ? [] : JSON.parse(data);
        res.render('gallery', { posts });
    });
});

// 4. Dettaglio singolo Post
app.get('/post/:id', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.send("Errore database");
        const posts = JSON.parse(data);
        const post = posts.find(p => p.id === req.params.id);
        
        if (!post) return res.status(404).send("Post non trovato");
        res.render('detail', { post });
    });
});

app.listen(3000, () => console.log('Server attivo: http://localhost:3000/post'));