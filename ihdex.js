const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Backend lpding..... ')
})

//User Managment
app.get('/users', (req, res) => {
  res.send('Got All users ')
})
app.post('/users', (req, res) => {
  res.send('Got a POST users')
})
app.put('/users', (req, res) => {
  res.send('Got a PUT users ')
})
app.delete('/users', (req, res) => {
  res.send('Got a DELETE users ')
})

///product
app.get('/product', (req, res) => {
  res.send('product')
}) 
app.post('/product', (req, res) => {
  res.send('Got a POST request')
})
app.put('/product', (req, res) => {
  res.send('Got a PUT request ')
})

app.delete('/product', (req, res) => {
  res.send('Got a DELETE request ')
}) 

app.get('/users/:id', (req, res) => {
  res.send(req.params)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})