import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'thong-ke' })
export class ThongKeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ThongKeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ngắt kết nối: ${client.id}`);
  }

  sendThongKe(data: any) {
    this.server.emit('cap-nhat-thong-ke', data);
  }
}
