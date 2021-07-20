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

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
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

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    console.log(person)
    response.json(person)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})