const express = require('express');
const app = express();
const port = 3002;
const operations = require('./operations');
const Joi = require('joi');
const pdfmake = require('pdfmake');

app.use(express.json());

const schemaJugador = Joi.object().keys({
  id: Joi.number().required(),
  nombre: Joi.string().required(),
  apellido: Joi.string().required(),
  posición: Joi.string().required(),
  equipo: Joi.string().required(),
  goles: Joi.number().required(),
  asistencias: Joi.number().required(),

});


app.get('/jugadores', async (req, res) => {
  try {
    const jugadores = await operations.leerArchivo();
    res.json(jugadores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error leyendo el archivo' });
  }
});

app.get('/jugadores/:idJugador', async (req, res) => {
  try {
    const jugadores = await operations.leerArchivo();
    const idJugador = req.params.idJugador;
    const jugador = jugadores.find((jugador) => jugador.id === parseInt(idJugador));
    if (!jugador) {
      res.status(404).json({ message: 'No se encuentra el jugador' });
    } else {
      res.json(jugador);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error leyendo el archivo' });
  }
});


app.post('/jugadores', async (req, res) => {
  try {
    const jugador = req.body;
    const { error } = schemaJugador.validate(jugador);
    if (error) {
      res.status(400).json({ message: 'Los datos del jugador son inválidos' });
    } else {
      const jugadores = await operations.leerArchivo();
      jugadores.push(jugador);
      await operations.escribirArchivo(jugadores);
      res.json(jugador);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error escribiendo archivo' });
  }
});


app.put('/jugadores/:idJugador', async (req, res) => {
  try {
    const idJugador = req.params.idJugador;
    const jugador = req.body;
    const { error } = schemaJugador.validate(jugador);
    if (error) {
      res.status(400).json({ message: 'Los datos del jugador son inválidos' });
    } else {
      const jugadores = await operations.leerArchivo();
      const index = jugadores.findIndex((jugador) => jugador.id === parseInt(idJugador));
      if (index === -1) {
        res.status(404).json({ message: 'Jugador no encontrado' });
      } else {
        jugadores[index] = jugador;
        await operations.escribirArchivo(jugadores);
        res.json(jugador);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error escribiendo el archivo' });
  }
});

app.delete('/jugadores/:idJugador', async (req, res) => {
  try {
    const idJugador = req.params.idJugador;
    const jugadores = await operations.leerArchivo();
    const index = jugadores.findIndex((jugador) => jugador.id === parseInt(idJugador));
    if (index === -1) {
      res.status(404).json({ message: 'Jugador no encontrado' });
    } else {
      jugadores.splice(index, 1);
      await operations.escribirArchivo(jugadores);
      res.json({ message: 'Jugador eliminado' });
    }
  } catch (err) {
    console.error(err);
    res.status( 500).json({ message: 'Error escribiendo archivo' });
  }
});


app.get('/jugadores/pdf', async (req, res) => {
  try {
    const jugadores = await operations.leerArchivo();
    const pdf = pdfMake.createPdf({
      content: [
        {
          text: 'Jugadores de fútbol',
          fontSize: 24,
          bold: true,
          margin: [0, 20, 0, 20],
        },
        {
          table: {
            body: jugadores.map((jugador) => [
              jugador.nombre,
              jugador.apellido,
              jugador.posición,
              jugador.equipo,
              jugador.goles,
              jugador.asistencias,
            ]),
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
          },
        },
      ],
      layout: 'portrait',
      pageSize: 'A4',
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="jugadores.pdf"');
    pdf.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generando PDF' });
  }
});


app.listen(3002, () => {
  console.log('Servidor iniciado en puerto 3002');
});