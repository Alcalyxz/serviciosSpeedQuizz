const mysql = require('mysql');
var pool = mysql.createPool({
   host: 'bidymhlzbianwu4rbvbz-mysql.services.clever-cloud.com',
   user: 'utmlyantmo4y6c38',
   password: 'cyKdSXX4o1T3nfxMkbO8',
   database: 'bidymhlzbianwu4rbvbz',
   port: 3306
});
 /* connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta.');
   }
});  */





module.exports = pool;

//connection.end(); pablo123