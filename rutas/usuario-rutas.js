const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/usuario-controlador');
const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol'); 


router.use(autenticacion);

router.get('/', verificarRol(['superadmin']), usuarioControlador.getUsuarios);



module.exports = router;