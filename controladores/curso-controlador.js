const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Curso = require('../modelos/Curso');

const crearCurso = async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;

        const docenteId = req.usuarioAutenticado.usuarioId;

        const nuevoCurso = new Curso({
            nombre,
            descripcion,
            docenteId,
            estudianteId: []   
        });

        await nuevoCurso.save();

        res.status(201).json({ mensaje: 'Curso creado correctamente', curso: nuevoCurso });

    } catch (error) {
        console.error('Error al crear curso:', error);
        res.status(500).json({ mensaje: 'Error al crear curso', error });
    }
};

const getCursos = async (req, res, next) => {
    try {
        const cursos = await Curso.find().select('-estudianteId -createdAt -updatedAt -__v').populate('docenteId', 'nombre email');
        res.status(200).json({ cursos });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los cursos', error });
    }
};

const getCursoPorId = async (req, res, next) => {
    try {
        const curso = await Curso.findById(req.params.id).select('-estudianteId -createdAt -updatedAt -__v').populate('docenteId', 'nombre email');
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
    
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const curso = await Curso.findById(id);

        if (!curso) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }

        if (curso.docenteId.toString() !== req.usuarioAutenticado.usuarioId) {
            return res.status(403).json({ mensaje: 'No tienes permiso para editar este curso' });
        }

        
        if (nombre) curso.nombre = nombre;
        if (descripcion) curso.descripcion = descripcion;

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

        if (curso.docenteId.toString() !== req.usuarioAutenticado.usuarioId) {
            return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este curso' });
        }

        await curso.deleteOne();

        res.status(200).json({ mensaje: 'Curso eliminado' });

    } catch (error) {
        console.error('Error al eliminar curso:', error);
        res.status(500).json({ mensaje: 'Error al eliminar curso', error });
    }
};

const getCursosDelProfesor = async (req, res, next) => {
    try {
        const cursos = await Curso.find({ docenteId: req.params.id });
        res.status(200).json({ cursos });
    } catch (error) {
        console.error('Error al obtener cursos del profesor:', error);
        res.status(500).json({ mensaje: 'Error al obtener cursos del profesor', error });
    }
};



exports.crearCurso = crearCurso;
exports.getCursos = getCursos;
exports.getCursoPorId = getCursoPorId;
exports.editarCurso = editarCurso;
exports.eliminarCurso = eliminarCurso;
exports.getCursosDelProfesor = getCursosDelProfesor;