const express = require('express');
const app = express();

//setings
app.set('port', process.env.PORT || 3000);

//middlewars
app.use(express.json());

//routes
app.use(require('./routes/questions'));

app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});

