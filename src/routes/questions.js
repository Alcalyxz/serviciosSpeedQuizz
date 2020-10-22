const express = require('express');
const router = express.Router();
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('165044966075-9ldb1hk170c9oi17sgp7m9s4qg6mkihe.apps.googleusercontent.com');

const mysqlConnection = require('../database');

router.get('/tipopregunta', (req, res) => {
    mysqlConnection.query('SELECT nombre FROM bidymhlzbianwu4rbvbz.Tipo', (err, rows, fields) => {
        if (!err) {
            res.json(rows)
        } else {
            console.log(err);
        }
    });
})

router.get('/usuarios', (req, res) => {
    mysqlConnection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Usuario', (err, rows, fields) => {
        if (!err) {
            res.json(rows)
        } else {
            console.log(err);
        }
    });
})

router.get('/dificultadpregunta', (req, res) => {
    mysqlConnection.query('SELECT nivel FROM bidymhlzbianwu4rbvbz.Dificultad', (err, rows, fields) => {
        if (!err) {
            res.json(rows)
        } else {
            console.log(err);
        }
    });
})

router.get('/:correo', (req, res) => {
    const { correo } = req.params;
    mysqlConnection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Usuario where correo = ?', [correo], (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})



//UPDATE `bidymhlzbianwu4rbvbz`.`Usuario` SET `puntuacion` = '80' 
//WHERE (`id_Usuario` = '1') and (`Li_id_Liga` = '1') and (`Est_id_estado` = '1');

router.put('/:correo', (req, res) => {
    const { puntuacion } = req.body;
    const { correo } = req.params;

    mysqlConnection.query('UPDATE bidymhlzbianwu4rbvbz.Usuario SET puntuacion=? where correo=?', [puntuacion, correo], (err, rows, fields) => {
        if (!err) {
            console.log("Actualizado con exito");
            res.json("respusido");
        } else {
            console.log(err);
        }
    });
})

router.post('/agregar', (req, res) => {
    const usuario = req.body;
    var query = mysqlConnection.query('INSERT INTO bidymhlzbianwu4rbvbz.Usuario (Tip_id_TipoLogin, nombre, nickname, correo, password, fecha_nacimiento, icono, puntuacion, institucion, carrera, Li_id_Liga, Est_id_estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);',
    [1, usuario.nombre, usuario.nickName, usuario.correo, usuario.contrasena, usuario.fechaNacimiento, 'sinIconoPorAhora',0, usuario.institucion, usuario.carrera, 1, 1 ], function (error, result) {
        if (error) {
            throw error;
        } else {
            console.log(result);
        }
    }
    );

    console.log(usuario);
    res.json("respusido");

});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '165044966075-9ldb1hk170c9oi17sgp7m9s4qg6mkihe.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return{
        nomre: payload.name,
        correo: payload.email,
        foto: payload.picture
    }
    
   

  }
  

router.post('/g-login', async (req, res) => {
     let token = req.body.token;

     let googleUser = await verify(token).catch(err => {
        return res.status(403, json({
            ok: false,
            error: err
        }));
     });

     

    res.json({
        usuario: googleUser
    });
}); 


module.exports = router;