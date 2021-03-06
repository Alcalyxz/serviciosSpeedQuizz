const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('165044966075-9ldb1hk170c9oi17sgp7m9s4qg6mkihe.apps.googleusercontent.com');
const random = require('random');
const axios = require('axios');

const mysqlPoolConnection = require('../database');

router.get('/tipopregunta', (req, res) => {
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT nombre FROM bidymhlzbianwu4rbvbz.Tipo', (err, rows, fields) => {
            if (!err) {
                res.json(rows)
            } else {
                console.log(err);
            }
        });
        connection.release();
    });
});


router.get('/usuarios', (req, res) => {
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Usuario', (err, rows, fields) => {
            if (!err) {
                res.json(rows)
            } else {
                console.log(err);
            }
        });
        connection.release();
    });
});

router.get('/dificultadpregunta', (req, res) => {
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT nivel FROM bidymhlzbianwu4rbvbz.Dificultad', (err, rows, fields) => {
            if (!err) {
                res.json(rows)
            } else {
                console.log(err);
            }
        });
        connection.release();
    });
});

router.get('/gPregunta/:tipo', (req, res) => {
    const { tipo } = req.params;
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Pregunta AS p WHERE p.Ti_id_tipo= ? ', [tipo], async (err, rows, fields) => {
            if (!err) {
                let r = random.int(0, rows.length - 1);

                let pregunta = rows[r];

                connection.release();

                let opciones = await getOpcion(pregunta.id_Pregunta);
                let ayuda = await getAyuda(pregunta.id_Pregunta);
                let costos = await getCostos(pregunta.id_Pregunta);

                if (tipo == 4) {
                    opciones = opciones[0].contenido.split('-');
                    /* console.log(opciones); */

                }

                if (tipo == 5) {
                    let opcionesmejores = [];
                    let otroVector = [];
                    let contador = 0;
                    let aux2 = 1;
                    opciones = opciones[0].contenido.split(',');
                    for (opcion of opciones) {
                        let aux = opcion.split('-');
                        opcionesmejores.push(aux[0]);
                        opcionesmejores.push(aux[1]);
                    }
                    for (opcionMejor of opcionesmejores) {
                        if (contador > 1) {
                            aux2++
                            contador = 0
                        }
                        let aux3 = {
                            contenido: opcionMejor,
                            valor: aux2
                        }
                        otroVector.push(aux3);
                        contador++
                    }
                    opciones = otroVector;
                }

                if (tipo != 4) {
                    opciones = shuffle(opciones);
                }



                res.json({
                    idPregunta: pregunta.id_Pregunta,
                    tipoPregunta: pregunta.Ti_id_tipo,
                    enunciado: pregunta.enunciado,
                    opciones: opciones,
                    ayuda: ayuda[0].contenido,
                    tip: pregunta.tip,
                    costos: costos
                });


            } else {
                console.log(err);
            }
        });

    });
});

router.get('/gTodasPreguntas/:tipo', (req, res) => {
    const { tipo } = req.params;
    let preguntas = [];
    let pregunta = {};  
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Pregunta AS p WHERE p.Ti_id_tipo= ? ', [tipo], async (err, rows, fields) => {
            if(!err){
                let preguntasDB = rows; 
                //console.log(preguntasDB);
                connection.release();
                for(row of preguntasDB){
                    let opciones = await getOpcion(row.id_Pregunta);
                    let ayuda = await getAyuda(row.id_Pregunta);
                    let costos = await getCostos(row.id_Pregunta);
                    pregunta = {
                        idPregunta: row.id_Pregunta,
                        tipoPregunta: row.Ti_id_tipo,
                        enunciado: row.enunciado,
                        opciones: opciones,
                        ayuda: ayuda[0].contenido,
                        tip: row.tip,
                        costos: costos
                    }
                    preguntas.push(pregunta); 
                }
                res.json({
                    total: preguntas.length,
                    preguntas: preguntas
                });
            }else{
                res.json({
                    err: err
                })
            }
        });
    });
});
        


router.get('/gQuiz', async (req, res) => {
    const CANTIDAD_PREGUNTAS = 10;
    let tipoPreg = 1;
    let quiz = [];
    let aux;
    let aux2; 
    for (let i = 0; i < CANTIDAD_PREGUNTAS; i++) {
        if (i != 0 && i % 2 == 0) {
            tipoPreg++;
            /* console.log(tipoPreg); */
        }
        if (quiz.length !=0) {
            do {
                await axios.get(`https://speedquiz-services.herokuapp.com/gPregunta/${tipoPreg}`).then(res => {
                    aux = res.data;
                });
                aux2 = quiz.map(data => data.idPregunta)
            } while (aux2.indexOf(aux.idPregunta) >= 0);
            quiz.push(aux);
        }else{
            await axios.get(`https://speedquiz-services.herokuapp.com/gPregunta/${tipoPreg}`).then(res => {
                quiz.push(res.data);
            });
        }

    }
   /*  console.log(aux2); */
    res.json({
        size: quiz.length,
        quiz: shuffle(quiz)
    });



    /* axios.get(`http://localhost:3000/gPregunta/${tipoPreg}`).then(res => {
        console.log(res.data);
    }) */
});

router.get('/gPreguntaDificultad/:tipo/:dif', (req, res) => {
    const { tipo } = req.params;
    const {dif} = req.params;
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Pregunta AS p WHERE p.Ti_id_tipo= ? AND p.Dif_id_dificultad = ?', [tipo, dif], async (err, rows, fields) => {
            if (!err) {
                let r = random.int(0, rows.length - 1);

                let pregunta = rows[r];

                connection.release();

                let opciones = await getOpcion(pregunta.id_Pregunta);
                let ayuda = await getAyuda(pregunta.id_Pregunta);
                let costos = await getCostos(pregunta.id_Pregunta);

                if (tipo == 4) {
                    opciones = opciones[0].contenido.split('-');
                    /* console.log(opciones); */

                }

                if (tipo == 5) {
                    let opcionesmejores = [];
                    let otroVector = [];
                    let contador = 0;
                    let aux2 = 1;
                    opciones = opciones[0].contenido.split(',');
                    for (opcion of opciones) {
                        let aux = opcion.split('-');
                        opcionesmejores.push(aux[0]);
                        opcionesmejores.push(aux[1]);
                    }
                    for (opcionMejor of opcionesmejores) {
                        if (contador > 1) {
                            aux2++
                            contador = 0
                        }
                        let aux3 = {
                            contenido: opcionMejor,
                            valor: aux2
                        }
                        otroVector.push(aux3);
                        contador++
                    }
                    opciones = otroVector;
                }

                if (tipo != 4) {
                    opciones = shuffle(opciones);
                }



                res.json({
                    idPregunta: pregunta.id_Pregunta,
                    tipoPregunta: pregunta.Ti_id_tipo,
                    enunciado: pregunta.enunciado,
                    opciones: opciones,
                    ayuda: ayuda[0].contenido,
                    tip: pregunta.tip,
                    costos: costos
                });


            } else {
                console.log(err);
            }
        });

    });
});

router.get('/gQuizDificultad/:dif', async (req, res) => {
    const CANTIDAD_PREGUNTAS = 10;
    const {dif} = req.params;
    let tipoPreg = 1;
    let quiz = [];
    let aux;
    let aux2; 
    for (let i = 0; i < CANTIDAD_PREGUNTAS; i++) {
        if (i != 0 && i % 2 == 0) {
            tipoPreg++;
            /* console.log(tipoPreg); */
        }
        if (quiz.length !=0) {
            do {
                await axios.get(`https://speedquiz-services.herokuapp.com/gPreguntaDificultad/${tipoPreg}/${dif}`).then(res => {
                    aux = res.data;
                });
                aux2 = quiz.map(data => data.idPregunta)
            } while (aux2.indexOf(aux.idPregunta) >= 0);
            quiz.push(aux);
        }else{
            await axios.get(`https://speedquiz-services.herokuapp.com/gPreguntaDificultad/${tipoPreg}/${dif}`).then(res => {
                quiz.push(res.data);
            });
        }

    }
   /*  console.log(aux2); */
    res.json({
        size: quiz.length,
        quiz: shuffle(quiz)
    });



    /* axios.get(`http://localhost:3000/gPregunta/${tipoPreg}`).then(res => {
        console.log(res.data);
    }) */
});



/* function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  } */

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


function getOpcion(id_pregunta) {
    return new Promise((resolve, reject) => {
        mysqlPoolConnection.getConnection((err, connection) => {
            connection.query('SELECT o.contenido, op.correcta from bidymhlzbianwu4rbvbz.OpcionXPregunta as op INNER JOIN bidymhlzbianwu4rbvbz.Opcion AS o ON op.Op_id_Opcion = o.id_Opcion  WHERE op.Pr_id_Pregunta = ?', [id_pregunta], (err, rows, fields) => {
                if (!err) {
                    let respuestas = rows;

                    connection.release();
                    resolve(respuestas);

                } else {
                    connection.release();
                    reject(err);
                }
            });

        });
    });
}

function getAyuda(id_pregunta) {
    return new Promise((resolve, reject) => {
        mysqlPoolConnection.getConnection((err, connection) => {
            connection.query('SELECT a.contenido from bidymhlzbianwu4rbvbz.Pregunta AS p INNER JOIN bidymhlzbianwu4rbvbz.Ayuda AS a ON p.id_Pregunta = a.Pr_id_Pregunta WHERE p.id_Pregunta = ?', [id_pregunta], (err, rows, fields) => {
                if (!err) {
                    let respuestas = rows;

                    connection.release();
                    resolve(respuestas);

                } else {
                    connection.release();
                    reject(err);
                }
            });

        });
    });
}

function getCostos(id_pregunta) {
    return new Promise((resolve, reject) => {
        mysqlPoolConnection.getConnection((err, connection) => {
            connection.query('SELECT d.costo_ayuda, d.puntos_acierto, d.puntos_fracaso, d.nivel from bidymhlzbianwu4rbvbz.Pregunta AS p INNER JOIN bidymhlzbianwu4rbvbz.Dificultad as d ON p.Dif_id_dificultad = d.id_dificultad WHERE p.id_Pregunta = ?', [id_pregunta], (err, rows, fields) => {
                if (!err) {
                    let respuestas = rows;

                    connection.release();
                    resolve(respuestas);

                } else {
                    connection.release();
                    reject(err);
                }
            });

        });
    });
}

/*  */

router.get('/:correo', (req, res) => {
    const { correo } = req.params;
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('SELECT * FROM bidymhlzbianwu4rbvbz.Usuario where correo = ?', [correo], (err, rows, fields) => {
            if (!err) {
                res.json(rows);
            } else {
                console.log(err);
            }
        });
        connection.release();
    });
});





//UPDATE `bidymhlzbianwu4rbvbz`.`Usuario` SET `puntuacion` = '80' 
//WHERE (`id_Usuario` = '1') and (`Li_id_Liga` = '1') and (`Est_id_estado` = '1');

router.put('/:correo', (req, res) => {
    const usModifica = req.body;
    if (usModifica.fecha_nacimiento == null || usModifica.fecha_nacimiento == '' || usModifica.fecha_nacimiento == 'null') {
        usModifica.fecha_nacimiento = '0000-00-00';
    }
    const { correo } = req.params;
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('UPDATE bidymhlzbianwu4rbvbz.Usuario SET nombre=?, nickname= ?, correo= ?, fecha_nacimiento= ?, institucion= ?, carrera = ?  where correo=?',
            [usModifica.nombre, usModifica.nickname, usModifica.correo, usModifica.fecha_nacimiento, usModifica.institucion, usModifica.carrera, correo], (err, rows, fields) => {
                if (!err) {
                    console.log("Actualizado con exito");
                    res.json({
                        state: 'changed',
                        err: false
                    });
                } else {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.json({
                            state: 'failed',
                            err: 'Campo (s) repetidos'
                        });
                    } else if (err.code === 'ER_DATA_TOO_LONG') {
                        res.json({
                            state: 'failed',
                            err: 'Campo (s) demasiado largos'
                        });
                    }
                }
            });
        connection.release();
    });
});

router.put('/cambioContra/:correo', (req, res) => {
    const Upassword = req.body;
    const { correo } = req.params;
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('UPDATE bidymhlzbianwu4rbvbz.Usuario SET password = ?  where correo=?',
            [Upassword.password, correo], (err, rows, fields) => {
                if (!err) {
                    console.log("Actualizado con exito");
                    res.json({
                        state: 'changed',
                        err: false
                    });
                } else {
                    if (err.code === 'ER_DATA_TOO_LONG') {
                        res.json({
                            state: 'failed',
                            err: 'Campo (s) demasiado largos'
                        });
                    }
                }
            });
        connection.release();
    });
});

router.put('/cambioPuntaje/:correo', async (req, res) => {
    const puntaje = req.body;
    const { correo } = req.params;
    let puntajeAct = await getPuntaje(correo);
    console.log('se obtuvo el puntaje actual, es ', puntajeAct);
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('UPDATE bidymhlzbianwu4rbvbz.Usuario SET puntuacion = ?  where correo=?',
            [puntaje.puntaje + puntajeAct[0].puntuacion, correo], (err, rows, fields) => {
                if (!err) {
                    console.log("Actualizado con exito");
                    res.json({
                        state: 'changed',
                        err: false
                    });
                } else {
                    if (err.code === 'ER_DATA_TOO_LONG') {
                        res.json({
                            state: 'failed',
                            err: 'Campo (s) demasiado largos'
                        });
                    }
                }
            });
        connection.release();
    });
});



function getPuntaje(correo) {
    console.log('entra a obtener el puntaje');
    return new Promise((resolve, reject) => {
        console.log('entra a la promesa')
        mysqlPoolConnection.getConnection((err, connection) => {
            console.log('obtiene la conexión');
            connection.query('SELECT puntuacion from bidymhlzbianwu4rbvbz.Usuario WHERE correo = ?', [correo], (err, rows, fields) => {
                console.log('Obtiene bien la query');
                if (!err) {
                    let respuestas = rows;

                    connection.release();
                    console.log('devuelve el puntaje');
                    resolve(respuestas);

                } else {
                    connection.release();
                    console.log(err)
                    reject(err);
                }
            });

        });
    });
}


router.post('/agregar', (req, res) => {
    const usuario = req.body;
    if (usuario.fecha_nacimiento == null || usuario.fecha_nacimiento == '' || usuario.fecha_nacimiento == 'null') {
        usuario.fecha_nacimiento = '0000-00-00';
    }
    mysqlPoolConnection.getConnection((err, connection) => {
        connection.query('INSERT INTO bidymhlzbianwu4rbvbz.Usuario (Tip_id_TipoLogin, nombre, nickname, correo, password, fecha_nacimiento, icono, puntuacion, institucion, carrera, Li_id_Liga, Est_id_estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);',
            [1, usuario.nombre, usuario.nickname, usuario.correo, usuario.password, usuario.fecha_nacimiento, 'sinIconoPorAhora', 0, usuario.institucion, usuario.carrera, 1, 1], function (err, result) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.json({
                            state: 'failed',
                            err: 'Campo (s) repetidos'
                        });
                    } else if (err.code === 'ER_DATA_TOO_LONG') {
                        res.json({
                            state: 'failed',
                            err: 'Campo (s) demasiado largos'
                        });
                    }
                } else {
                    res.json("respusido");
                    console.log("Agregado con exito");
                }
            });
        connection.release();
    });

    console.log(usuario);


});








async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '165044966075-9ldb1hk170c9oi17sgp7m9s4qg6mkihe.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
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