const express = require('express');
const router = express.Router();

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

module.exports = router;