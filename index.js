require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())

app.use(cors())

app.use(express.static('build'))

morgan.token('body', (request, response) =>{
  if (request.body) return JSON.stringify(request.body)
})

app.use(morgan((tokens, request, response) => {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens['body'](request, response)
  ].join(' ')
}))

app.get('/api/persons', (request, response) => {
  console.log('fetching phonebook')
    Person.find({}).then(persons => {
      response.json(persons)
    })
})

app.get('/info', async (request, response) => {
    const result = await Person.count({})
    response.send(
        `<p>Phonebook has info for ${result} people</p>
        <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', async (request, response) => {
    const result = await Person.findById(request.params.id)
    return response.json(result)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  console.log(persons)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  console.log(person)
  response.json(person)
})

const generateId = () => {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER / 4)
}

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})