const { validationResult } = require('express-validator');
const Calificacion = require('../modelos/Calificacion');

const Curso = require('../modelos/Curso');

const crearCalificacion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }


  const { cursoId, estudianteId, nota } = req.body;
  const usuarioId = req.usuarioAutenticado.usuarioId;

  try {
    const curso = await Curso.findById(cursoId);
    
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });
    
    if (curso.docenteId.toString() !== usuarioId) {
        return res.status(403).json({ mensaje: 'No tienes permiso para calificar en este curso' });
    }
    
    const calificacionExistente = await Calificacion.findOne({
        cursoId,
        estudianteId
    });

    if (calificacionExistente) {
        return res.status(400).json({ mensaje: 'Ya existe una calificación para este estudiante en este curso.' });
    }

    const nuevaCalificacion = new Calificacion({ 
        cursoId, 
        estudianteId, 
        nota 
    });
    await nuevaCalificacion.save();

    res.status(201).json({ mensaje: 'Calificación creada', calificacion: nuevaCalificacion });
  } catch (error) {
    console.error('Error al crear calificación:', error);
    res.status(500).json({ mensaje: 'Error al crear la calificación', error });
  }
};

const editarCalificacion = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  
  const { id } = req.params;
  const { nota } = req.body;
  const usuarioId = req.usuarioAutenticado.usuarioId;

  try {
    const calificacion = await Calificacion.findById(id).populate('cursoId');
    if (!calificacion) return res.status(404).json({ mensaje: 'Calificación no encontrada' });

    if (calificacion.cursoId.docenteId.toString() !== usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar esta calificación' });
    }

    calificacion.nota = nota;
    await calificacion.save();

    res.status(200).json({ mensaje: 'Calificación actualizada', calificacion });
  } catch (error) {
    console.error('Error al editar la calificación:', error);
    res.status(500).json({ mensaje: 'Error al editar la calificación', error });
  }
};


const getCalificacionesPorEstudiante = async (req, res, next) => {
  const estudianteId = req.params.id;
  const usuarioId = req.usuarioAutenticado.usuarioId;
  const rol = req.usuarioAutenticado.rol;

  try {
    const calificaciones = await Calificacion.find({ estudianteId });

    if (calificaciones.length === 0) {
      return res.status(404).json({ mensaje: 'No hay calificaciones para este estudiante.' });
    }

    if (usuarioId === estudianteId || rol === 'superadmin') {
      return res.status(200).json({ calificaciones });
    }

    for (let calificacion of calificaciones) {
      const curso = await Curso.findById(calificacion.cursoId);
      if (curso && curso.docenteId.toString() === usuarioId) {
        return res.status(200).json({ calificaciones });
      }
    }

    return res.status(403).json({ mensaje: 'No tienes permiso para ver estas calificaciones.' });

  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener calificaciones.' });
  }
};




exports.crearCalificacion = crearCalificacion;
exports.editarCalificacion = editarCalificacion;
exports.getCalificacionesPorEstudiante = getCalificacionesPorEstudiante;

