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
    .connect("mongodb://127.0.0.1:27017/vpsdb", {
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



app.post('/api/new/', async (req, res) => {
    const { name, os, location } = req.body;
    if (!name || !os || !location) {
        res.send({
            StatusCode: 400,
            error: "Missing Parameters"
        });
    } else {

        const docker = new Docker();
        const image = 'ubuntu';

        docker.createContainer({
            Image: image,
            Tty: true,
            ExposedPorts: { '80/tcp': {}, '22/tcp': {} },
            HostConfig: {
                PortBindings: { '80/tcp': [{ HostPort: '' }], '22/tcp': [{ HostPort: '' }] },
            },
        }).then(async (container) => {
            container.start();
            const sshServer = `apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo 'root:password' | chpasswd && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && /usr/sbin/sshd -D`;
            await container.exec({
                Cmd: ['/bin/bash', '-c', sshServer],
                'AttachStdout': true,
                'AttachStderr': true,
            });
            container.inspect().then(async(data) => {
                console.log(data);

                const containerId = container.id;
                const exposedPort = '80/tcp, 22/tcp';

                console.log(container);

                const openPorts = Object.keys(data.NetworkSettings.Ports).map((port) => {
                    return port.split('/')[0];
                }).join(', ');


                console.log(`Container ID: ${containerId}`);
                console.log(`Exposed Port: ${exposedPort}`);

                return res.send({
                    StatusCode: 200,
                    containerId,
                    exposedPort,
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


    }
});


const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});