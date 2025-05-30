const express = require('express');
const router = express.Router();
const calificacionControlador = require('../controladores/calificacion-controlador');
const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.post('/', verificarRol(['docente', 'superadmin']), calificacionControlador.crearCalificacion);
router.patch('/:id', verificarRol(['docente', 'superadmin']), calificacionControlador.editarCalificacion);
router.get('/estudiante/:id', verificarRol(['docente', 'superadmin', 'estudiante']), calificacionControlador.getCalificacionesPorEstudiante);

module.exports = router;
