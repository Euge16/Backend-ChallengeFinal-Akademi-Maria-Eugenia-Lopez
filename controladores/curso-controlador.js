const { validationResult } = require('express-validator');
const Curso = require('../modelos/Curso');

const crearCurso = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, descripcion, cupo } = req.body;
    const docenteId = req.usuarioAutenticado.usuarioId;

    if (req.usuarioAutenticado.rol !== 'docente') {
      return res.status(403).json({ mensaje: 'Solo un docente puede crear cursos' });
    }
    
    try {

        const nuevoCurso = new Curso({
            nombre,
            descripcion,
            docenteId,
            estudiantes: [],
            cupo   
        });

        await nuevoCurso.save();

        res.status(201).json({ mensaje: 'Curso creado correctamente', curso: nuevoCurso });

    } catch (error) {
        console.error('Error al crear curso:', error);
        res.status(500).json({ mensaje: 'Error al crear curso', error });
    }
};

const getCursos = async (req, res, next) => {
    const { pagina , limite, nombre } = req.query;
    const paginaInt = parseInt(pagina);
    const limiteInt = parseInt(limite);
    const filtro = {};
    if(nombre) filtro.nombre = new RegExp(nombre, 'i');
    
    try {
        const cursos = await Curso.find(filtro).select('nombre descripcion docenteId cupo').populate('docenteId', 'nombre email')
            .skip((paginaInt - 1) * limiteInt)
            .limit(limiteInt);

        const total = await Curso.countDocuments(filtro);
        res.status(200).json({
            paginaActual: paginaInt,
            totalPaginas: Math.ceil(total / limiteInt),
            totalRegistros: total,
            cursos
        });

    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los cursos', error });
    }
};

const getCursoPorId = async (req, res, next) => {
    try {
        const curso = await Curso.findById(req.params.id).select('nombre descripcion docenteId cupo').populate('docenteId', 'nombre email');
        if (!curso) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }
        res.status(200).json({ curso });
    } catch (error) {
        console.error('Error al obtener curso:', error);
        res.status(500).json({ mensaje: 'Error al obtener curso', error });
    }
};

const editarCurso = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { id } = req.params;
        const { nombre, descripcion, cupo } = req.body;

        const curso = await Curso.findById(id);
        if (!curso) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }

        if ( req.usuarioAutenticado.rol !== 'superadmin' && curso.docenteId.toString() !== req.usuarioAutenticado.usuarioId.toString()) {
            return res.status(403).json({ mensaje: 'No tienes permiso para editar este curso' });
        }

        if (nombre) curso.nombre = nombre;
        if (descripcion) curso.descripcion = descripcion;
        if (cupo) curso.cupo = cupo;

        await curso.save();

        res.status(200).json({ mensaje: 'Curso actualizado', curso });

    } catch (error) {
        console.error('Error al editar curso:', error);
        res.status(500).json({ mensaje: 'Error al editar curso', error });
    }
};

const eliminarCurso = async (req, res, next) => {
    try {
        const curso = await Curso.findById(req.params.id);

        if (!curso) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }

        if ( req.usuarioAutenticado.rol !== 'superadmin' && curso.docenteId.toString() !== req.usuarioAutenticado.usuarioId ) {
            return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este curso' });
        }

        await curso.deleteOne();

        res.status(200).json({ mensaje: 'Curso eliminado' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar curso', error });
    }
};

const getCursosDelProfesor = async (req, res, next) => {
    const { pagina, limite, nombre } = req.query;
    const paginaInt = parseInt(pagina);
    const limiteInt = parseInt(limite);
    const usuarioId = req.usuarioAutenticado.usuarioId;
    const { id } = req.params;

  
    if (usuarioId !== id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para ver estos cursos.' });
    }

    
    const filtro = {};
    if (nombre) filtro.nombre = new RegExp(nombre, 'i');

    try { 
        const cursos = await Curso.find({ docenteId: id, ...filtro })
            .select('nombre descripcion docenteId cupo')
            .populate('docenteId', 'nombre email')
            .skip((paginaInt - 1) * limiteInt)
            .limit(limiteInt);

        const total = await Curso.countDocuments({ docenteId: id, ...filtro });

        res.status(200).json({
            paginaActual: paginaInt,
            totalPaginas: Math.ceil(total / limiteInt),
            totalRegistros: total,
            cursos
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener cursos del profesor', error });
    }
};




exports.crearCurso = crearCurso;
exports.getCursos = getCursos;
exports.getCursoPorId = getCursoPorId;
exports.editarCurso = editarCurso;
exports.eliminarCurso = eliminarCurso;
exports.getCursosDelProfesor = getCursosDelProfesor;