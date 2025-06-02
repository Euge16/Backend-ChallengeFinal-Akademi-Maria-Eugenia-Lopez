const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const autenticacionControlador = require('../controladores/autenticacion-controlador');



router.post(
    '/registrarse',
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
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ],
    autenticacionControlador.registrarEstudiante
);

router.post(
    '/iniciar-sesion', 
    [
        check('email')
            .trim()
            .notEmpty().withMessage('El correo electrónico no puede estar vacío').bail()
            .normalizeEmail({ gmail_remove_dots: false })
            .isEmail().withMessage('Debe ser un correo electrónico válido'),
        check('password')
            .trim()
            .notEmpty().withMessage('La contraseña no puede estar vacía').bail()
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ],
    autenticacionControlador.iniciarSesion
);

router.post(
    '/recuperar-password',
    [
        check('email')
            .trim()
            .notEmpty().withMessage('El correo electrónico no puede estar vacío').bail()
            .normalizeEmail({ gmail_remove_dots: false })
            .isEmail().withMessage('Debe ser un correo electrónico válido')
    ],
    autenticacionControlador.solicitarRecuperacionPassword
);

router.post(
    '/restablecer-password/:token',
    [
        check('nuevaPassword')
            .trim()
            .notEmpty().withMessage('La contraseña no puede estar vacía').bail()
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ], 
    autenticacionControlador.restablecerPassword
);

module.exports = router;