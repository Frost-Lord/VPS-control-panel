const express = require("express");
const app = express();
const path = require("path");
const axios = require('axios');
const fs = require('fs');
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const Docker = require('dockerode');

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

mongoose
    .connect("mongodb://127.0.0.1:27017/studentdb", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Unable to connect to MongoDB Database.\nError: " + err);
    });
mongoose.connection.on("err", (err) => {
    console.error(`Mongoose connection error: \n ${err.stack}`);
});
mongoose.connection.on("disconnected", () => {
    console.log("Mongoose connection disconnected");
});



app.post('/api/new/:id', async (req, res) => {
    const id = req.params.id;
    const docker = new Docker();
    const image = 'ubuntu';

    docker.createContainer({
        Image: image,
        Tty: true,
        ExposedPorts: { '80/tcp': {} },
        HostConfig: {
          PortBindings: { '80/tcp': [{ HostPort: '' }] },
        },
      }).then((container) => {
        return container.start();
      }).then((container) => {
        const containerId = container.id;

        const exposedPort = '80/tcp';
        const hostPort = container.modem.inspectPort({ port: exposedPort }).HostPort;

        container.inspect().then((data) => {
          const openPorts = Object.keys(data.NetworkSettings.Ports).map((port) => {
            return port.split('/')[0];
          }).join(', ');

          console.log(`Container ID: ${containerId}`);
          console.log(`Exposed Port: ${exposedPort}`);
          console.log(`Host Port: ${hostPort}`);
          console.log(`Open Ports: ${openPorts}`);

            res.send({ 
                StatusCode: 200,
                containerId,
                exposedPort,
                hostPort,
                openPorts
            });
        });
      }).catch((error) => {
        console.log(error);
        res.send({
            error: error,
            StatusCode: 500
        })
      });
});