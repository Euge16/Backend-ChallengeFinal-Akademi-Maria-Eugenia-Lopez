const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/usuario-controlador');
const autenticacion = require('../interceptor/autenticacion');

const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);
router.get('/', verificarRol(['superadmin']), usuarioControlador.getUsuarios);
router.get('/:id', usuarioControlador.getUsuarioPorId);
router.post('/', verificarRol(['superadmin']), usuarioControlador.crearDocenteOSuperadmin);
router.patch('/:id', usuarioControlador.editarUsuario);
router.delete('/:id', usuarioControlador.eliminarUsuario);




module.exports = router;