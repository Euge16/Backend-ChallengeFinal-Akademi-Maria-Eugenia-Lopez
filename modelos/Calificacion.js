const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  cursoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  estudianteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nota: { type: Number, required: true, min: 0, max: 10 }
}, { timestamps: true });

module.exports = mongoose.model('Calificacion', calificacionSchema, 'calificaciones');
