import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { AppService } from './app.service'

import { Client, Message } from '@prisma/client'

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) { }

  //GET /clients
  @Get('clients')
  async clients(): Promise<Client[]> {
    return await this.appService.getAllClients()
  }

  //GET /clients/<id>
  @Get('/clients/:id')
  async getClientById(@Param('id') id: string): Promise<Client> {
    return await this.appService.getClientById(parseInt(id))
  }
  //GET /clients-to-do-follow-up
  @Get('/clients-to-do-follow-up')
  async clientsToDoFollowUp(): Promise<Client[]> {
    return await this.appService.getClientsToDoFollowUp()
  }

  //POST /client
  @Post('client')
  async createClient(@Body() clientData: any): Promise<Client> {
    return await this.appService.createClient(clientData)
  }

  //POST clients/<id>/message
  /*
  modified the function a bit to simply deliver the text as a string
  and returns the conversation with the generated response
  */
  @Post('clients/:id/message/:message')
  async createMessage(
    @Param('id') id: string,
    @Param('message') message: string): Promise<Message[]> {
    return await this.appService.createMessageForClient(parseInt(id), message)
  }

  //GET clients/<id>/generateMessage
  @Get('clients/:id/generateMessage')
  async generateMessage(@Param('id') id: string): Promise<string> {
    return await this.appService.generateMessageForClient(parseInt(id));
  }
}
