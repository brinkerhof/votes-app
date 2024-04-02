import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'

export async function getPoll(app: FastifyInstance) {
  app.get(
    '/polls/:pollId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const getPollParamsSchema = z.object({
        pollId: z.string().uuid(),
      })

      const { pollId } = getPollParamsSchema.parse(request.params)

      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
          options: { select: { id: true, title: true } },
        },
      })

      if (!poll) {
        return reply.status(404).send({ message: 'Poll not found' })
      }

      const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

      const votes = result.reduce(
        (obj, line, index) => {
          if (index % 2 === 0) {
            const score = result[index + 1]
            Object.assign(obj, { [line]: Number(score) })
          }
          return obj
        },
        {} as Record<string, number>,
      )

      const pollWithScore = {
        ...poll,
        options: poll.options.map((option) => ({
          ...option,
          score: votes[option.id] || 0,
        })),
      }

      return reply.send({ pollWithScore })
    },
  )
}
