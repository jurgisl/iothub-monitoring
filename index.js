// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';

var Promise = require('bluebird');
var EventHubClient = require('azure-event-hubs').Client;

var args = process.argv.slice(2);

var connectionString = args[0];
var eventHubPath = args[1];

var printError = function (err) {
  console.error(err.message);
};

var printEvent = function (ehEvent) {
  console.log('Event Received: ');
  console.log(JSON.stringify(ehEvent.body));
  console.log('');
};

var client = EventHubClient.fromConnectionString(connectionString, eventHubPath);
var receiveAfterTime = Date.now() - 5000;

client.open()
      .then(client.getPartitionIds.bind(client))
      .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
          return client.createReceiver('$Default', partitionId, { 'startAfterTime' : receiveAfterTime}).then(function(receiver) {
            receiver.on('errorReceived', printError);
            receiver.on('message', printEvent);
          });
        });
      })
      .then(client.createSender.bind(client))
      .catch(printError);