const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Superadmin, Docente, Usuario } = require('../modelos/Usuario');


const getUsuarios = async (req, res, next) => {
  const { pagina , limite } = req.query;
  const paginaInt = parseInt(pagina);
  const limiteInt = parseInt(limite);
  try {
    const usuarios = await Usuario.find({}, '-password')
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    const total = await Usuario.countDocuments();
    res.json({
      paginaActual: paginaInt,
      totalPaginas: Math.ceil(total / limiteInt),
      totalRegistros: total,
      usuarios: usuarios
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los usuarios. Intente más tarde.' });
  }
};

const getUsuarioPorId = async (req, res, next) => {
  const usuarioId = req.params.id;

  if (req.usuarioAutenticado.rol !== 'superadmin' && req.usuarioAutenticado.usuarioId !== usuarioId) {
    return res.status(403).json({ message: 'No tienes permiso para ver este usuario.' });
  }

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      ...req.body
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el usuario.' });
  }
};


const eliminarUsuario = async (req, res, next) => {
  const usuarioId = req.params.id;

  if (req.usuarioAutenticado.rol !== 'superadmin' && req.usuarioAutenticado.usuarioId !== usuarioId) {
    return res.status(403).json({ message: 'No tienes permiso para eliminar este usuario.' });
  }

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await Usuario.findByIdAndDelete(usuarioId);

    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};


const editarUsuario = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).json({ message: 'Datos inválidos, por favor revisa los campos.' });
  }

  const usuarioId = req.params.id;
  const { nombre, email, rol, biografia, titulo } = req.body;

  if (req.usuarioAutenticado.rol !== 'superadmin' && req.usuarioAutenticado.usuarioId !== usuarioId) {
    return res.status(403).json({ message: 'No tienes permiso para editar este usuario.' });
  }

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }


    if (rol && req.usuarioAutenticado.rol !== 'superadmin') {
      return res.status(403).json({ message: 'No puedes modificar el rol.' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    if (rol) {
      usuario.rol = rol;
    }
    if ('biografia' in req.body) usuario.biografia = biografia;
    if ('titulo' in req.body) usuario.titulo = titulo;


    await usuario.save();

    res.json({
      message: 'Usuario actualizado correctamente.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ...req.body
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};


const crearDocenteOSuperadmin = async (req, res, next) => {
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