const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const Usuario = require('../modelos/Usuario');

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
    const { id } = req.params;
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ usuario });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el usuario.' });
    }
};

const eliminarUsuario = async (req, res, next) => {
  const usuarioId = req.params.id;

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await usuario.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente.' });
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
  const { nombre, email, rol } = req.body;


  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (rol && req.usuarioAutenticado.rol !== 'admin') {
      return res.status(403).json({ message: 'No puedes modificar el rol.' });
    }

    if (req.usuarioAutenticado.rol !== 'admin' && usuarioId !== req.usuarioAutenticado.usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para editar este usuario.' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    if (rol) {
      usuario.rol = rol;
    }

    await usuario.save();

    res.json({
      message: 'Usuario actualizado correctamente.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};


exports.getUsuarios = getUsuarios;
exports.getUsuarioPorId = getUsuarioPorId;
exports.editarUsuario = editarUsuario;
exports.eliminarUsuario = eliminarUsuario;