const express = require('express');
const router = express.Router();
const autenticacionControlador = require('../controladores/autenticacion-controlador');



router.post('/registrarse', autenticacionControlador.registrarEstudiante);

router.post('/iniciar-sesion', autenticacionControlador.iniciarSesion);

router.post('/recuperar-password', autenticacionControlador.solicitarRecuperacionPassword);

router.post('/restablecer-password/:token', autenticacionControlador.restablecerPassword);

module.exports = router;