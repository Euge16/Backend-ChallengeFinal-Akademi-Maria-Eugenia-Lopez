module.exports = (rolesPermitidos) => {
    return (req, res, next) => {
        const { usuarioAutenticado } = req;
        if (!usuarioAutenticado || !rolesPermitidos.includes(usuarioAutenticado.rol)) {
            return res.status(403).json({ mensaje: 'Acceso denegado: rol no autorizado.' });
        }

        next();
    };
};

