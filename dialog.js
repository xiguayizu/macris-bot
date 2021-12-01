/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const venom = require('venom-bot');
const express = require('express');
const http = require('http');
const { WebhookClient } = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

venom
  .create({ headless: false })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

app.post('/webhook', function (request, response) {
  const agent = new WebhookClient({ request, response });
  let intentMap = new Map();
  intentMap.set('nomedaintencao', nomedafuncao)
  agent.handleRequest(intentMap);
});
function nomedafuncao(agent) {
}

const sessionClient = new dialogflow.SessionsClient({ keyFilename: "macrisbot-w9nx-a1cb30e08b28.json" });

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
  let context;
  let intentResponse;
  for (const query of queries) {
    try {
      intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode
      );
      return `${intentResponse.queryResult.fulfillmentText}`
    } catch (error) {
      console.log(error);
    }
  }
}

function start(client) {
  client.onMessage(async (msg) => {
    if (msg.type === 'chat' && msg.isGroupMsg === false) {
      let textoResposta = await executeQueries('macrisbot-w9nx', msg.from, [msg.body], 'pt-BR')
      client.sendText(msg.from, textoResposta.replace(/\\n/g, '\n'));
    }
  });
}

server.listen(port, function () {
  console.log('App running on *: ' + port);
});