const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const cursoSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    docenteId: { type: mongoose.Types.ObjectId, required: true, ref: 'Usuario'},
    estudiantes: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Usuario'}],
    cupo: { type: Number, required: true, default: 4 }

}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);