var express = require('express');
var router = express.Router();
const fs = require('fs');
const { v4: uuid } = require('uuid');

function sendJsonResponse(res, status, data) {
  res.status(status).json(data);
}

function loadData(req, res, next) {
  const raw = fs.readFileSync('data.json');
  req.data = JSON.parse(raw);
  next();
}

function saveData(req) {
  try {
    const data = fs.writeFileSync('data.json', JSON.stringify(req.data));
  } catch (err) {
    console.log('Error writing json file: ', err);
  }
}

router.use(loadData);

// get all channels
router.get('/channel', function(req, res, next) {
  if (!req.data) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  sendJsonResponse(res, 200, Object.keys(req.data));
});

// get channels by id
router.get('/channel/:channelId', function(req, res, next) {
  if (!req.data[req.params.channelId]) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  sendJsonResponse(res, 200, req.data[req.params.channelId]);
});

router.post('/channel/:channelId', function(req, res, next) {
  var channel = req.params.channelId;

  if (!req.data[channel]) {
    req.data[channel] = [];
  }

  var message = {
    username: req.body.username,
    message: req.body.message,
    id: uuid(),
    created_on: Date.now(),
    updated_on: null
  }

  req.data[channel].push(message);

  saveData(req);

  sendJsonResponse(res, 201, message);
});

router.patch('/channel/:channelId', function(req, res, next) {
  var channel = req.params.channelId;

  if (!req.data[channel]) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  req.data[channel] = req.body;

  saveData(req);

  sendJsonResponse(res, 200, req.data[channel]);
});

router.delete('/channel/:channelId', function(req, res, next) {
  var channel = req.params.channelId;

  if (!req.data[channel]) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  delete req.data[channel];

  saveData(req);

  sendJsonResponse(res, 200, { message: `successfully deleted ${channel}` });
});

module.exports = router;
