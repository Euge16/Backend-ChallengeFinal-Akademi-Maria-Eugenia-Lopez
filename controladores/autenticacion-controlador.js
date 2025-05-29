const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const {Usuario, Estudiante} = require('../modelos/Usuario');


const registrarEstudiante = async (req, res, next) => {

  const { nombre, email, password, rol } = req.body;


  let usuarioExistente;
  try {
    usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(422).json({ message: 'El usuario ya existe. Por favor inicie sesión.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const nuevoUsuario = new Estudiante({
      nombre,
      email,
      password: hashedPassword,
      rol: rol
    });

    await nuevoUsuario.save();

    res.status(201).json({
      usuarioId: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario. Intente más tarde.' });
  }
};


const iniciarSesion = async (req, res, next) => {
  const { email, password } = req.body;

  let usuario;
  try {
    usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { usuarioId: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión. Intente más tarde.' });
  }
};

const solicitarRecuperacionPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_KEY, { expiresIn: '1h' });

    const transporte = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USUARIO,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const emailOpciones = {
      from: process.env.EMAIL_USUARIO,
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en este enlace para restablecer tu contraseña: http://localhost:5000/api/autenticacion/restablecer-password/${token}`
    };

    await transporte.sendMail(emailOpciones);

    res.json({ mensaje: 'Correo enviado con instrucciones.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
  }
};

const restablecerPassword = async (req, res, next) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  try {
    const datosRecuperacion = jwt.verify(token, process.env.JWT_KEY);

    const usuario = await Usuario.findById(datosRecuperacion.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Hashear nueva contraseña
    const passwordHasheada = await bcrypt.hash(nuevaPassword, 12);
    usuario.password = passwordHasheada;

    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: 'Token inválido o expirado.' });
  }
};


exports.registrarEstudiante = registrarEstudiante;
exports.iniciarSesion = iniciarSesion;
exports.solicitarRecuperacionPassword = solicitarRecuperacionPassword;
exports.restablecerPassword = restablecerPassword;