var express = require('express');
var router = express.Router();
const fs = require('fs');
const { v4: uuid } = require('uuid');

function sendJsonResponse(res, status, data) {
  res.status(status).json(data);
}

function loadData(req, res, next) {
  const raw = fs.readFileSync('posts.json');
  req.data = JSON.parse(raw);
  next();
}

function saveData(req) {
  try {
    const data = fs.writeFileSync('posts.json', JSON.stringify(req.data));
  } catch (err) {
    console.log('Error writing json file: ', err);
  }
}

router.use(loadData);

// get all post
router.get('/', function(req, res, next) {
  if (!req.data) {
    sendJsonResponse(res, 500, { message: "get all post not found" });
  }

  sendJsonResponse(res, 200, req.data);
});

// get post by id
router.get('/:postId', function(req, res, next) {
  if (!req.data.filter(item => item.id == req.params.postId)) {
    sendJsonResponse(res, 500, { message: "post not found" });
  }

  sendJsonResponse(res, 200, req.data.filter(item => item.id == req.params.postId)[0]);
});

router.post('/', function(req, res, next) {
  var post = req.params.postId;

  if (!req.body.title || !req.body.body) {
    sendJsonResponse(res, 400, { message: "malformed data, must be a single object with title and body fields" });
  }

  var newMessage = {
    title: req.body.title,
    body: req.body.body,
    id: uuid(),
    created_on: Date.now(),
    updated_on: null
  }

  req.data.push(newMessage);

  saveData(req);

  sendJsonResponse(res, 201, newMessage);
});

router.patch('/:postId', function(req, res, next) {
  var post = req.params.postId;

  if (!req.data.filter(item => item.id == req.params.postId)) {
    sendJsonResponse(res, 500, { message: "post not found" });
  }

  var newData = req.body;

  var data = req.data.filter(item => item.id != req.params.postId);
  data.push(newData);

  console.log(data);
  req.data = data;

  saveData(req);

  sendJsonResponse(res, 200, newData);
});

router.delete('/:postId', function(req, res, next) {
  var post = req.params.postId;

  if (!req.data.filter(item => item.id == req.params.postId)) {
    sendJsonResponse(res, 500, { message: "post not found" });
  }

  req.data = req.data.filter(item => item.id != req.params.postId);

  saveData(req);

  sendJsonResponse(res, 200, { message: `successfully deleted ${post}` });
});

module.exports = router;
