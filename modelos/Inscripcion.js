const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const inscripcionSchema = new Schema({
    estudianteId: { type: mongoose.Types.ObjectId, required: true, ref: 'Usuario'},
    cursoId: { type: mongoose.Types.ObjectId, required: true, ref: 'Curso'}
}, { timestamps: true });


module.exports = mongoose.model('Inscripcion', inscripcionSchema, 'inscripciones');