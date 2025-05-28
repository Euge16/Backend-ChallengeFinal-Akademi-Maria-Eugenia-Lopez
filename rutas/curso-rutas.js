const express = require('express');
const router = express.Router();
const cursoControlador = require('../controladores/curso-controlador');
const autenticacion = require('../interceptor/autenticacion');

const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.post('/', verificarRol(['docente']), cursoControlador.crearCurso);

router.get('/', verificarRol(['superadmin', 'estudiante']), cursoControlador.getCursos);
router.get('/docente/:id', verificarRol(['superadmin','docente']), cursoControlador.getCursosDelProfesor);
router.get('/:id', cursoControlador.getCursoPorId);

router.patch('/:id', verificarRol(['docente']), cursoControlador.editarCurso);

router.delete('/:id', verificarRol(['superadmin', 'docente']), cursoControlador.eliminarCurso);




module.exports = router;