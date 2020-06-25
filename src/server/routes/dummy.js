const dummyRoutes = require('express').Router();

dummyRoutes.get('/test', async (req, res) => {
  res.status(200).json({ message: 'dummy test' });
});

module.exports = dummyRoutes;
