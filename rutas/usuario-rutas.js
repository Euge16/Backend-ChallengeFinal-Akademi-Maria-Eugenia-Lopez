const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const usuarioControlador = require('../controladores/usuario-controlador');
const autenticacion = require('../interceptor/autenticacion');

const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.get('/', verificarRol(['superadmin']), usuarioControlador.getUsuarios);

router.get('/:id', usuarioControlador.getUsuarioPorId);

router.post(
    '/',
    [
        check('nombre')
            .trim()
            .notEmpty().withMessage('El nombre no puede estar vacío').bail(),
        check('email')
            .trim()
            .notEmpty().withMessage('El correo electrónico no puede estar vacío').bail()
            .normalizeEmail({ gmail_remove_dots: false })
            .isEmail().withMessage('Debe ser un correo electrónico válido'),
        check('password')
            .trim()
            .notEmpty().withMessage('La contraseña no puede estar vacía').bail()
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        check('rol')
            .notEmpty().withMessage('El rol es obligatorio').bail()
            .isIn(['superadmin', 'docente']).withMessage('Rol inválido. Debe ser "superadmin" o "docente"'),
        check('titulo')
            .optional({ checkFalsy: true })
            .isLength({ max: 100 }).withMessage('El título debe tener como máximo 100 caracteres'),
        check('biografia')
            .optional({ checkFalsy: true })
            .isLength({ max: 1000 }).withMessage('La biografía debe tener como máximo 1000 caracteres')
    ],
    verificarRol(['superadmin']), 
    usuarioControlador.crearDocenteOSuperadmin
);

router.patch(
    '/:id',
    [
        check('nombre')
            .trim()
            .notEmpty().withMessage('El nombre no puede estar vacío').bail(),
        check('email')
            .trim()
            .notEmpty().withMessage('El correo electrónico no puede estar vacío').bail()
            .normalizeEmail({ gmail_remove_dots: false })
            .isEmail().withMessage('Debe ser un correo electrónico válido'),
        check('rol')
            .optional({ checkFalsy: true })
            .isIn(['superadmin', 'docente']).withMessage('Rol inválido'),
        check('titulo')
            .optional({ checkFalsy: true })
            .isLength({ max: 100 }).withMessage('El título debe tener como máximo 100 caracteres'),
        check('biografia')
            .optional({ checkFalsy: true })
            .isLength({ max: 1000 }).withMessage('La biografía debe tener como máximo 1000 caracteres')
    ],
    usuarioControlador.editarUsuario
);

router.delete('/:id', usuarioControlador.eliminarUsuario);




module.exports = router;