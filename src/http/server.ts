import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import websocket from '@fastify/websocket'
import { pollResults } from './ws/poll-results'

const app = fastify()

app.register(cookie, {
  secret: 'owiajwoadjicmcnmi2wioo2',
  hook: 'onRequest',
})

app.register(websocket)

app.register(createPoll)
app.register(voteOnPoll)
app.register(getPoll)

app.register(pollResults)

app.listen({ port: 3333 }).then(() => {
  console.log(`Server is running on ${3333}`)
})
