const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbConfig.js');
const secret = require('../database/secret')
/* const authenticate = require('../auth/authenticate') */

const { authenticate, jwtKey } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  registerHelper(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });

}

function login(req, res) {
  // implement user login
  let { username, password } = req.body;

  loginHelper({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        console.log('token', token)

        res.status(200).json({
          message: `${user.username} logged in.`,
          token,
        });
        console.log('token', token)
      } else {
        res.status(401).json({ message: "access denied" })
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

function registerHelper(user) {
  return db('users')
    .insert(user, 'id')
    .then(ids => {
      const [id] = ids;
      return findById(id)
    });
}

function findById(id) {
  return db('users')
    .where({ id })
    .first();
}


function loginHelper(param) {
  return db('users').where(param)
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };

  const options = {
    expiresIn: '5h',
  }

  return jwt.sign(payload, secret.jwtSecret, options)
}