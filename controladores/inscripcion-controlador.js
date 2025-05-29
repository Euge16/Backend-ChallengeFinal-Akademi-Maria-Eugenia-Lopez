const Inscripcion = require('../modelos/Inscripcion');
const Curso = require('../modelos/Curso');
const { Usuario } = require('../modelos/Usuario');

const crearInscripcion = async (req, res, next) => {
    const { cursoId } = req.body;
    const estudianteId = req.usuarioAutenticado.usuarioId;

    try {
        
        const curso = await Curso.findById(cursoId);
        if (!curso) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }
        
        const existeInscripcion = await Inscripcion.findOne({ estudianteId, cursoId });
        if (existeInscripcion) {
            return res.status(400).json({ mensaje: 'Ya estas inscrito a este curso' });
        }

        const inscriptosCantidad = await Inscripcion.countDocuments({ cursoId });
        if (inscriptosCantidad >= curso.cupo) {
            return res.status(400).json({ mensaje: 'El curso ya alcanzo su cupo maximo.' });
        }


        const nuevaInscripcion = new Inscripcion({ 
            estudianteId, 
            cursoId 
        });
        await nuevaInscripcion.save();

        curso.estudiantes.push(estudianteId);
        await curso.save();

        return res.status(201).json({ mensaje: 'Te has inscrito correctamente', inscripcion: nuevaInscripcion });
    } catch (error) {
        console.error('Error al inscribirse:', error);
        return res.status(500).json({ mensaje: 'Error al inscribirse al curso', error });
    }
}

const getInscripcionesPorEstudiante = async (req, res) => {
    const { id } = req.params;

    try {
        const estudiante = await Usuario.findById(id); 
        if (!estudiante) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        const inscripciones = await Inscripcion.find({ estudianteId: id })
            .populate('cursoId', 'nombre descripcion')
            .populate('estudianteId', 'nombre email');

        if(!inscripciones || inscripciones.length === 0){
            return res.status(404).json({ message: 'No tienes inscripciones.' });
        }

        return res.status(200).json({ inscripciones });
    } catch (error) {
        console.error('Error al obtener inscripciones:', error);
        return res.status(500).json({ mensaje: 'Error al obtener inscripciones', error });
    }
};


const eliminarInscripcion = async (req, res, next) => {
  const { id } = req.params;
  const estudianteId = req.usuarioAutenticado.usuarioId;

  try {
    const inscripcion = await Inscripcion.findById(id);
    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'Inscripción no encontrada.' });
    }

    if (inscripcion.estudianteId.toString() !== estudianteId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para cancelar esta inscripción.' });
    }

    await inscripcion.deleteOne();

    const curso = await Curso.findById(inscripcion.cursoId);
    if (curso) {
      curso.estudiantes = curso.estudiantes.filter(id => id.toString() !== estudianteId);
      await curso.save();
    }

    res.json({ message: 'Inscripción cancelada.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar inscripción', error });
  }
};

const getInscripcionesPorCurso = async (req, res, next) => {
  const { id } = req.params;
  const usuarioId = req.usuarioAutenticado.usuarioId;
  const rol = req.usuarioAutenticado.rol;

  try {
    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado.' });
    }

    if (curso.docenteId.toString() !== usuarioId && rol !== 'superadmin') {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver las inscripciones de este curso.' });
    }

    const inscripciones = await Inscripcion.find({ cursoId: id })
      .populate('estudianteId', 'nombre email'); 

    res.status(200).json({ inscripciones });

  } catch (error) {
    console.error('Error al obtener inscripciones por curso:', error);
    res.status(500).json({ mensaje: 'Error al obtener las inscripciones del curso.', error });
  }
};



exports.crearInscripcion = crearInscripcion;
exports.getInscripcionesPorEstudiante = getInscripcionesPorEstudiante;
exports.eliminarInscripcion = eliminarInscripcion;
exports.getInscripcionesPorCurso = getInscripcionesPorCurso;