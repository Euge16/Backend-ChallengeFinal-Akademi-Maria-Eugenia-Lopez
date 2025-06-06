const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const cursoControlador = require('../controladores/curso-controlador');
const autenticacion = require('../interceptor/autenticacion');

const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.post(
    '/',
    [
        check('nombre')
            .trim()
            .notEmpty().withMessage('El nombre no puede estar vacío').bail(),
        check('descripcion')
            .trim()
            .notEmpty().withMessage('La descripción no puede estar vacia').bail(),
        check('cupo')
            .notEmpty().withMessage('El cupo no puede estar vacío').bail()
            .isInt({ min: 1 }).withMessage('El cupo debe ser un número entero mayor a 0'),
    ],
    verificarRol(['docente']), 
    cursoControlador.crearCurso
);

router.get('/', verificarRol(['superadmin', 'estudiante']), cursoControlador.getCursos);
router.get('/docente/:id', verificarRol(['docente']), cursoControlador.getCursosDelProfesor);
router.get('/:id', cursoControlador.getCursoPorId);

router.patch(
    '/:id',
    [
        check('nombre')
            .trim()
            .notEmpty().withMessage('El nombre no puede estar vacío').bail(),
        check('descripcion')
            .trim()
            .notEmpty().withMessage('La descripción no puede estar vacia').bail(),
        check('cupo')
            .notEmpty().withMessage('El cupo no puede estar vacío').bail()
            .isInt({ min: 1 }).withMessage('El cupo debe ser un número entero mayor a 0'),
    ],
    verificarRol(['docente','superadmin']), 
    cursoControlador.editarCurso
);

router.delete('/:id', verificarRol(['superadmin', 'docente']), cursoControlador.eliminarCurso);




module.exports = router;