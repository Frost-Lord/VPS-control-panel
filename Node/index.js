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

    const containerName = 'ubuntu_ssh';
    const imageName = 'ubuntu';
    const exposedPort = '22/tcp';
    const containerPort = '22';
    const ip = '166.0.134.88';

    const docker = new Docker();
    docker.createNetwork({
      Name: 'my_networktt',
      Driver: 'bridge',
      IPAM: {
        Driver: 'default',
        Config: [
          {
            Subnet: '192.168.1.0/24',
            Gateway: '192.168.1.1'
          }
        ]
      },
      Options: {
        "com.docker.network.bridge.name": "my_custom_bridge",
        "com.docker.network.bridge.enable_icc": "true",
        "com.docker.network.bridge.enable_ip_masquerade": "true",
        "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0"
      }
    }, (err, network) => {
      if (err) {
        console.log('Error creating network:', err);
        return;
      }

      console.log('Created network:', network);

      // Create the container
      docker.createContainer({
        name: containerName,
        Image: imageName,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        HostConfig: {
          NetworkMode: 'netbridge',
          PortBindings: {
            [exposedPort]: [{ HostPort: containerPort }]
          }
        },
        NetworkingConfig: {
          EndpointsConfig: {
            my_networktt: {
              IPAMConfig: {
                IPv4Address: ip
              }
            }
          }
        }
      }, (err, container) => {
        if (err) {
          console.log('Error creating container:', err);
          return;
        }

        console.log('Created container:', container);

        // Start the container
        container.start((err) => {
          if (err) {
            console.log('Error starting container:', err);
            return;
          }

          console.log('Container started');
        });
        console.log(container.id)
        console.log(`Container ${containerName} started.`);
        const sshServer = `apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo 'root:password' | chpasswd && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && /usr/sbin/sshd -D`;
        container.exec({
          AttachStdout: true,
          AttachStderr: true,
          Cmd: ['sh', '-c', sshServer]
        });
      });
    });
  }
});


const server = app.listen(8080, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
