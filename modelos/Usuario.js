const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const usuarioSchema = new Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    rol: { type: String, enum: ['superadmin', 'docente', 'estudiante'], required: true, default: 'estudiante'},
   
}, { 
    discriminatorKey: 'rol',
    timestamps: true 
});

const Usuario = mongoose.model('Usuario', usuarioSchema);



const Superadmin = Usuario.discriminator('superadmin', new Schema({}));

const Docente = Usuario.discriminator('docente', new Schema({
    titulo: { type: String }, 
    biografia : { type: String }
}));

const Estudiante = Usuario.discriminator('estudiante', new Schema({
    biografia : { type: String }
}));


module.exports = { Usuario, Superadmin, Docente, Estudiante };



