const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const cursoSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    docenteId: { type: mongoose.Types.ObjectId, required: true, ref: 'Usuario'},
    estudianteId: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Usuario'}]

}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);