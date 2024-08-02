// Import relevant modules and types
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Configuration for environment variables
import { ConfigService } from '@nestjs/config';

// Configuration for the database ORM and the client table interface
import { PrismaClient, Client } from '@prisma/client';

// Library for managing OpenAI
import OpenAI from 'openai';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.prisma = new PrismaClient();
  }

  // Create the database connection at the start of execution, as well as the environment variables for the API key
  async onModuleInit() {
    await this.prisma.$connect();
    this.openai = new OpenAI(this.configService.get('OPENAI_API_KEY'));
  }
  // Disconnects from the database when the module is destroyed
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Retrieves all clients using the ORM
  async getAllClients(): Promise<Client[]> {
    return await this.prisma.client.findMany();
  }

  // Retrieves a client by ID using the ORM
  async getClientById(id: number): Promise<Client | null> {
    return await this.prisma.client.findUnique({
      where: { id: id },
    });
  }

  // Retrieves clients that need follow-up.
  // To do this, it fetches all conversations that have not yet finished.
  // If the last message of each conversation was sent more than a week ago,
  // it is marked as "for follow-up".
  async getClientsToDoFollowUp(): Promise<Client[]> {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const clients = await this.prisma.client.findMany({
      where: {
        finish: false,
      },
      include: {
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
      },
    });

    return clients.filter(client => {
      const lastMessage = client.messages[0];
      return lastMessage && lastMessage.sentAt < lastWeek;
    });
  }


  // This function creates a new client, including their messages and debts.
  // I suggest reviewing this function again to add error handling.

  async createClient(data: {
    name: string;
    rut: string;
    messages: { text: string; role: string; sentAt: string }[];
    debts: { amount: number; institution: string; dueDate: string }[];
  }): Promise<any> {

    const clientData = {
      name: data.name,
      rut: data.rut,
    };


    const newClient = await this.prisma.client.create({
      data: { ...clientData },
    });

    const messages = data.messages.map((msg) => ({
      text: msg.text,
      role: msg.role,
      sentAt: new Date(msg.sentAt),
      clientId: newClient.id
    }));

    await this.prisma.message.createMany({ data: messages });

    const debts = data.debts.map((debt) => ({
      amount: debt.amount,
      institution: debt.institution,
      dueDate: new Date(debt.dueDate),
      clientId: newClient.id
    }));

    await this.prisma.debts.createMany({ data: debts });

  }
  // English: This function is designed to test the code,
  // it receives an id, from a client, and a text, which would be the client's message
  // generates the bot's response automatically and saves everything in the database
  // finally returns the conversation that the client has had
  async createMessageForClient(clientId: number, message: string): Promise<any> {
    await this.prisma.message.create({
      data: {
        clientId: clientId,
        text: message,
        sentAt: new Date(),
        role: 'client',
      },
    });
    const response: string = await this.generateMessageForClient(clientId);
    await this.prisma.message.create({
      data: {
        clientId: clientId,
        text: response,
        sentAt: new Date(),
        role: 'agent',
      },
    });
    // Considering the cost of this operation for each call, in a real use case, I would modify it to be a daily or weekly check, and not within this function.
    const finished = await this.chatFiniched(clientId)
    if (finished) {
      await this.prisma.client.update({
        where: { id: clientId },
        data: { finish: true },
      });
    }

    return this.prisma.message.findMany({ where: { clientId: clientId } });
  }


  systemPropt(Debts: boolean) {
    const seller = "Juanin"
    const store = "La Fabrica de Suños";
    const cars = "1) suzuki swift 2024: 10.000.000 clp 2) suzuki baleno 2024: 15.000.000 clp";
    const cliente = "Cliente";
    const ofertas = Debts ? "No puedes Ofrecer financiamiento, ya que tiene deudas" : "Ofrecele financiamiento, ya que no tiene deudas."

    return `Tu numebre es ${seller}, El mejor y mas cariscmatico ejecutivo HUMANO de vetnas de la marca ${store}, la mejor automotora que has trabajado. te hablaran clientes y puedes ofrecer los sigueintes modelos, solo tenemos modelos nuevos:
    ${cars} 
    Estas hablando con: ${cliente} 
    ${ofertas}. 
    Tratalo bien, cuidalo y peinsa bien tus palabras, respira.
    ¡Eres el mejor no lo olvides!`
  }
  // I add motivational comments to guide the AI towards more optimal work
  // source: https://arxiv.org/abs/2211.01910



  //function that verifies with LLM if the conversation has ended
  // I decided to do it this way to allow the use of other LLMs 
  // that do not necessarily have the functionality to call actions
  async chatFiniched(clientId: number): Promise<boolean> {
    const Chat = JSON.stringify(this.prisma.message.findMany({ where: { clientId: clientId } }));
    const messages: any = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "Tu Funcion es esvaluar si es si la conversacion entregada fue finalizada, el usario te tentrgara una conversacion de ventas de veiculos y tu debe devolve EXTRICTAMENTE: 1 si finaliazo o 0 si no finalizo",
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: Chat,
          }
        ]
      },

    ]
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.1,
      max_tokens: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // here I could add error handling in case it doesn't deliver 
    // in the desired format, although if it happens it might probably

    if (response.choices[response.choices.length - 1].message.content == "1")
      return true;
    return false
  }


  async generateMessageForClient(clientId: number): Promise<string> {
    const listMessages = await this.prisma.message.findMany({ where: { clientId: clientId } });
    const Debts = await this.prisma.debts.findMany({ where: { clientId: clientId } })
    const context = this.systemPropt(Debts.length != 0)
    const messages: any = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: context,
          }
        ]
      },
      ...listMessages.map(msg => ({
        role: msg.role == 'agent' ? 'assistant' : 'user',
        content: [{
          type: "text",
          text: msg.text,
        }]
      }))
    ]

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      temperature: 0.5,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[response.choices.length - 1].message.content;

  }

}
