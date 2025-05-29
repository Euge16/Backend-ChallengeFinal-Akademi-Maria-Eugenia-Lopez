const express = require('express');
const router = express.Router();
const inscripcionControlador = require('../controladores/inscripcion-controlador');
const autenticacion = require('../interceptor/autenticacion');

const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.post('/', verificarRol(['estudiante']), inscripcionControlador.crearInscripcion);

router.get('/estudiante/:id', verificarRol(['estudiante', 'superadmin']), inscripcionControlador.getInscripcionesPorEstudiante);
router.get('/curso/:id', verificarRol(['docente', 'superadmin']), inscripcionControlador.getInscripcionesPorCurso);

router.delete('/:id', verificarRol(['estudiante']), inscripcionControlador.eliminarInscripcion);

module.exports = router;