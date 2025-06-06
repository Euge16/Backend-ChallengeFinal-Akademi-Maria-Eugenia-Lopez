const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const calificacionControlador = require('../controladores/calificacion-controlador');
const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.post(
    '/',
    [
        check('nota')
            .notEmpty().withMessage('La nota es obligatoria')
            .isFloat({ min: 1, max: 10 }).withMessage('La nota debe estar entre 1 y 10')
    ],
    verificarRol(['docente', 'superadmin']), 
    calificacionControlador.crearCalificacion
);
router.patch(
    '/:id',
    [
        check('nota')
            .notEmpty().withMessage('La nota es obligatoria')
            .isFloat({ min: 1, max: 10 }).withMessage('La nota debe estar entre 1 y 10')
    ],
    verificarRol(['docente', 'superadmin']), 
    calificacionControlador.editarCalificacion
    );
router.get('/estudiante/:id', verificarRol(['docente', 'superadmin', 'estudiante']), calificacionControlador.getCalificacionesPorEstudiante);

module.exports = router;
