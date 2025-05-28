const express = require('express');
require('./db/mongoose');
const autenticacionRutas = require('./rutas/autenticacion-rutas');
const usuarioRutas = require('./rutas/usuario-rutas');
const cursoRutas = require('./rutas/curso-rutas');

const app = express();


app.use(express.json());
app.use('/api/autenticacion', autenticacionRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/cursos', cursoRutas);


app.listen(5000);