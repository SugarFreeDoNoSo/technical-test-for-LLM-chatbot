# Car System Project

## Algorithm

The chatbot is quite simple. I call an LLM already designed for this function. To optimize the responses, I assigned the system a more human way of thinking and in Spanish to keep the language of the response in this language. Additionally, I added functionality using LLM independent of the model (since some OpenAI models can activate functions natively). This functionality determines if the conversation has ended and adjusts the database accordingly.

source: https://arxiv.org/abs/2211.01910

## Description

This application allows for the management of a car system with various functionalities, such as financing calculations and data verification using a large language model (LLM).

## Future Improvements

Due to time constraints, the following improvements were left pending:

- **Car dataset:** Integrate a file system in CSV format to store car data.
- **Financing calculation system:** Develop a functionality that allows for the calculation of financing required for car purchases.

## Running the app

To deploy the application using Docker, follow these steps:

1. **API Key configuration:** Before starting, make sure to enter the OpenAI API Key in the appropriate file.
2. **Deployment command:** Run the following command to build and deploy the application:
   ```sh
   docker-compose up --build
   ```

# Test

## 1. POST client

req:

```bash
  curl -X POST http://localhost:3000/client \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Perez",
    "rut": "11.111.111-1",
    "messages": [
        {
            "text": "Hola, quiero comprar un auto",
            "sentAt": "2023-12-24T00:00:00.000Z",
            "role": "client"
        },
        {
            "text": "Perfecto, te puedo ayudar con eso",
            "sentAt": "2023-12-24T00:00:00.000Z",
            "role": "agent"
        }
    ],
    "debts": [
        {
            "amount": 1000000,
            "institution": "Banco Estado",
            "dueDate": "2023-12-24T00:00:00.000Z"
        }
    ]
}'
```

## 2. POST client

req:

```bash
  curl -X POST http://localhost:3000/client \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juanin Perez",
    "rut": "21.111.111-1",
    "messages": [
        {
            "text": "Hola, quiero comprar un auto",
            "sentAt": "2023-12-24T00:00:00.000Z",
            "role": "client"
        },
        {
            "text": "Perfecto, te puedo ayudar con eso",
            "sentAt": "2023-12-24T00:00:00.000Z",
            "role": "agent"
        }
    ],
    "debts": []
}'
```

## 3. GET Clients

req:

```bash
curl --request GET \
  --url http://localhost:3000/clients

```

res:

```bash
[
  {
    "id": 1,
    "name": "Juan Perez",
    "rut": "11.111.111-1",
    "finish": false
  },
  {
    "id": 2,
    "name": "Juanin Perez",
    "rut": "21.111.111-1",
    "finish": false
  }
]
```

## 4. POST clients/1/message/...

req:

```bash
curl --request POST \
  --url 'http://localhost:3000/clients/1/message/necesito%20un%20auto,%20tienen%20financiamiento%20para%20mi' \
```

res:

```bash
[
  {
    "id": 1,
    "text": "Hola, quiero comprar un auto",
    "role": "client",
    "sentAt": "2023-12-24T00:00:00.000Z",
    "clientId": 1
  },
  {
    "id": 2,
    "text": "Perfecto, te puedo ayudar con eso",
    "role": "agent",
    "sentAt": "2023-12-24T00:00:00.000Z",
    "clientId": 1
  },
  {
    "id": 5,
    "text": "necesito un auto, tienen financiamiento para mi",
    "role": "client",
    "sentAt": "2024-08-01T16:10:36.586Z",
    "clientId": 1
  },
  {
    "id": 6,
    "text": "Lamentablemente, no ofrecemos financiamiento en este momento, especialmente si tienes deudas pendientes que podrían complicar el proceso. Sin embargo, puedo mostrarte los modelos disponibles que podrían interesarte. Tenemos el Suzuki Swift 2024 y el Suzuki Baleno 2024. ¿Te gustaría saber más sobre alguno de estos modelos?",
    "role": "agent",
    "sentAt": "2024-08-01T16:10:40.455Z",
    "clientId": 1
  }
]
```

## 5. POST clients/1/message/...

req:

```bash
curl --request POST \
  --url http://localhost:3000/clients/1/message/bueno%20entonces%20por%20ahora%20no%20podre%20comprar
```

res:

```bash
[
  {
    "id": 1,
    "text": "Hola, quiero comprar un auto",
    "role": "client",
    "sentAt": "2023-12-24T00:00:00.000Z",
    "clientId": 1
  },
  {
    "id": 2,
    "text": "Perfecto, te puedo ayudar con eso",
    "role": "agent",
    "sentAt": "2023-12-24T00:00:00.000Z",
    "clientId": 1
  },
  {
    "id": 5,
    "text": "necesito un auto, tienen financiamiento para mi",
    "role": "client",
    "sentAt": "2024-08-01T16:10:36.586Z",
    "clientId": 1
  },
  {
    "id": 6,
    "text": "Lamentablemente, no ofrecemos financiamiento en este momento, especialmente si tienes deudas pendientes que podrían complicar el proceso. Sin embargo, puedo mostrarte los modelos disponibles que podrían interesarte. Tenemos el Suzuki Swift 2024 y el Suzuki Baleno 2024. ¿Te gustaría saber más sobre alguno de estos modelos?",
    "role": "agent",
    "sentAt": "2024-08-01T16:10:40.455Z",
    "clientId": 1
  },
  {
    "id": 7,
    "text": "bueno entonces por ahora no podre comprar",
    "role": "client",
    "sentAt": "2024-08-01T16:13:10.134Z",
    "clientId": 1
  },
  {
    "id": 8,
    "text": "Entiendo completamente, y lamento que no podamos ofrecer una opción de financiamiento en este momento. Si en el futuro tu situación cambia o si deseas considerar alguna otra forma de adquisición, no dudes en volver a contactarnos. Estaremos más que felices de ayudarte a encontrar el auto perfecto para ti. ¡Gracias por considerar La Fábrica de Sueños, y espero que podamos ayudarte en el futuro!",
    "role": "agent",
    "sentAt": "2024-08-01T16:13:15.568Z",
    "clientId": 1
  }
]
```

## 6. GET Clients

req:

```bash
curl --request GET \
  --url http://localhost:3000/clients

```

res:

```bash
  [
  {
    "id": 1,
    "name": "Juan Perez",
    "rut": "11.111.111-1",
    "finish": true
  },
  {
    "id": 2,
    "name": "Juanin Perez",
    "rut": "21.111.111-1",
    "finish": false
  }
]
```

## 7. GET /clients-to-do-follow-up

req:

```bash
 curl --request GET \
  --url http://localhost:3000/clients-to-do-follow-up
```

res:

```bash
   []
```

## Conclusions

In the test, it worked as expected; more extensive testing should be performed to correctly validate the GET /clients-to-do-follow-up.
