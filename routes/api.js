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
router.get('/', function(req, res, next) {
  if (!req.data) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  sendJsonResponse(res, 200, Object.keys(req.data));
});

// get channels by id
router.get('/:channelId', function(req, res, next) {
  if (!req.data[req.params.channelId]) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  sendJsonResponse(res, 200, req.data[req.params.channelId]);
});

router.post('/:channelId', function(req, res, next) {
  var channel = req.params.channelId;

  if (!req.body.username || !req.body.message) {
    sendJsonResponse(res, 400, { message: "malformed data, must be a single object with username and message fields" });
  }

  if (!req.data[channel]) {
    req.data[channel] = [];
  }

  var newMessage = {
    username: req.body.username,
    message: req.body.message,
    id: uuid(),
    created_on: Date.now(),
    updated_on: null
  }

  req.data[channel].push(newMessage);

  saveData(req);

  sendJsonResponse(res, 201, newMessage);
});

router.patch('/:channelId', function(req, res, next) {
  var channel = req.params.channelId;

  if (!req.data[channel]) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  req.data[channel] = req.body;

  saveData(req);

  sendJsonResponse(res, 200, req.data[channel]);
});

router.delete('/:channelId', function(req, res, next) {
  var channel = req.params.channelId;

  if (!req.data[channel]) {
    sendJsonResponse(res, 500, { message: "channel not found" });
  }

  delete req.data[channel];

  saveData(req);

  sendJsonResponse(res, 200, { message: `successfully deleted ${channel}` });
});

module.exports = router;
