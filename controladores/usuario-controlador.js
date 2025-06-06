const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { Superadmin, Docente, Usuario } = require('../modelos/Usuario');


const getUsuarios = async (req, res, next) => {
  const { pagina , limite, nombre, email, rol } = req.query;
  const paginaInt = parseInt(pagina);
  const limiteInt = parseInt(limite);
  const filtro = {};
  if(nombre) filtro.nombre = new RegExp(nombre, 'i');
  if(email) filtro.email  = new RegExp(email, 'i');
  if(rol) filtro.rol  = new RegExp(rol, 'i');

  try {
    const usuarios = await Usuario.find(filtro, '-password')
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    const total = await Usuario.countDocuments(filtro);
    res.json({
      paginaActual: paginaInt,
      totalPaginas: Math.ceil(total / limiteInt),
      totalRegistros: total,
      usuarios: usuarios
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener los usuarios. Intente más tarde.' });
  }
};

const getUsuarioPorId = async (req, res, next) => {
  const usuarioId = req.params.id;

  
  if (req.usuarioAutenticado.rol !== 'superadmin' && req.usuarioAutenticado.usuarioId.toString() !== usuarioId.toString()) {
    return res.status(403).json({ mensaje: 'No tienes permiso para ver este usuario.' });
}


  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      titulo: usuario.titulo || null,
      biografia: usuario.biografia || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener el usuario.' });
  }
};


const eliminarUsuario = async (req, res, next) => {
  const usuarioId = req.params.id;

  if (req.usuarioAutenticado.rol !== 'superadmin' && req.usuarioAutenticado.usuarioId !== usuarioId) {
    return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este usuario.' });
  }

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    await Usuario.findByIdAndDelete(usuarioId);

    res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar el usuario.' });
  }
};


const editarUsuario = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const usuarioId = req.params.id;
  const { nombre, email, biografia, titulo, rol } = req.body;

  // Solo el superadmin o el mismo usuario puede editar
  if (req.usuarioAutenticado.rol !== 'superadmin' && req.usuarioAutenticado.usuarioId !== usuarioId) {
    return res.status(403).json({ mensaje: 'No tienes permiso para editar este usuario.' });
  }

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    if (rol && rol !== usuario.rol) {
      return res.status(400).json({ mensaje: 'No se puede cambiar el rol de un usuario existente.' });
    }

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;

    if (usuario.rol === 'docente') {
      if ('biografia' in req.body) usuario.biografia = biografia;
      if ('titulo' in req.body) usuario.titulo = titulo;
    } else if (usuario.rol === 'estudiante') {
      if ('biografia' in req.body) usuario.biografia = biografia;
    }

    await usuario.save();

    res.json({
      mensaje: 'Usuario actualizado correctamente.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el usuario.' });
  }
};




const crearDocenteOSuperadmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, email, password, rol, titulo, biografia } = req.body;

  if (!req.usuarioAutenticado || req.usuarioAutenticado.rol !== 'superadmin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Solo un superadmin puede crear este tipo de usuarios.' });
  }

  if (!['superadmin', 'docente'].includes(rol)) {
    return res.status(400).json({ mensaje: 'Rol inválido. Solo se permite crear usuarios con rol superadmin o docente.' });
  }

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado.' });
    }

    const passwordHasheada = await bcrypt.hash(password, 12);

    let nuevoUsuario;

    if (rol === 'superadmin') {
      nuevoUsuario = new Superadmin({
        nombre,
        email,
        password: passwordHasheada,
        rol
      });
    } else if (rol === 'docente') {
      nuevoUsuario = new Docente({
        nombre,
        email,
        password: passwordHasheada,
        rol,
        titulo,
        biografia
      });
    }

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario creado correctamente.',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear usuario.' });
  }
};



exports.getUsuarios = getUsuarios;
exports.getUsuarioPorId = getUsuarioPorId;
exports.editarUsuario = editarUsuario;
exports.eliminarUsuario = eliminarUsuario;
exports.crearDocenteOSuperadmin = crearDocenteOSuperadmin;