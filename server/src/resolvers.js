import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import faker from 'faker';

const channels = [];
let lastChannelId = 0;
let lastMessageId = 0;

function addChannel(name) {
  lastChannelId++;
  const newChannel = {
    id: lastChannelId,
    name: name,
    messages: []
  }
  channels.push(newChannel);
}

function getChannel(id) {
  let channel = channels.find(channel => channel.id === id);
  return channel;
}

function addMessage(channel, messageText) {
  lastMessageId++;
  const newMessage = {
    id: lastMessageId,
    text: messageText
  }
  channel.messages.push(newMessage);
}

// use faker to generate random messages in faker channel
addChannel('faker');
const channel = channels.find(channel => channel.name === 'faker');

// Add seed for consistent random data
faker.seed(9);
for (let id = 0; id < 50; id++) {
  channel.messages.push({
    id: id,
    text: faker.random.words()
  });
}

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },

    channel: (root, args) => {
      let id = parseInt(args.id)
      let cursor = args.cursor
      let channel = getChannel(id);
      if (cursor == undefined && messageFeed == undefined) {
        cursor = channel.messages.length;
      }
      let limit = 10;
      let messageFeed = {
        messages: channel.messages.slice(cursor-limit, cursor),
        cursor: cursor - limit
      }

      let channelWithMessageFeed = {
        id: channel.id,
        name: channel.name,
        messageFeed: messageFeed
      }

      return channelWithMessageFeed;
    },
  },
  Mutation: {
    addChannel: (root, args) => {
      const newChannel = { id: String(nextId++), messages: [], name: args.name };
      channels.push(newChannel);
      return newChannel;
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(channel => channel.id === message.channelId);
      if(!channel)
        throw new Error("Channel does not exist");

      const newMessage = { id: String(nextMessageId++), text: message.text };
      channel.messages.push(newMessage);

      pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId });

      return newMessage;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
        // The `messageAdded` channel includes events for all channels, so we filter to only
        // pass through events for the channel specified in the query
        return payload.channelId === variables.channelId;
      }),
    }
  },
};
