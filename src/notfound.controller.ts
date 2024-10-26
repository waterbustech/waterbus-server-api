import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Controller()
export class NotFoundController {
  private readonly logger = new Logger(NotFoundController.name);

  @All('*') // This decorator catches all HTTP methods and routes
  async handleNotFound(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    this.logger.warn(`404 Not Found: ${req.method} ${req.url}`);

    res.status(404).send({
      statusCode: 404,
      message: 'Resource not found',
      path: req.url,
    });
  }
}
