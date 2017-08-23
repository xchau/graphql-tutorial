import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import faker from 'faker';

const channels = [];
let lastChannelId = 0;
let lastMessageId = 0;

function addChannel(name) {
  lastChannelId++;
  const newChannel = {
    id: String(lastChannelId),
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
let fakerChannel = channels.find(channel => channel.name === 'faker');

// Add seed for consistent random data
faker.seed(9);
for (let i = 0; i < 50; i++) {
  addMessage(fakerChannel, faker.random.words());
}

// generate second channel for initial channel list view
addChannel('channel2');

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },

    channel: (root, {id, cursor}) => {
      const channel = getChannel(id);
      /*
      if (!cursor) {
        cursor = channel.messages.length;
      }
      let limit = 10;
      let messageFeed = {
        messages: channel.messages.slice(cursor-limit, cursor),
        cursor: cursor - limit
      }
      */
      /*
      let channelWithMessageFeed = {
        id: channel.id,
        name: channel.name,
        messageFeed: messageFeed
      }
      */
      return channel;
    },
  },
  Channel: {
    messageFeed: (channel, {cursor}) => {
      if (!cursor) {
        cursor = channel.messages.length;
      }
      let limit = 10;
      let messageFeed = {
        messages: channel.messages.slice(cursor-limit, cursor),
        cursor: cursor - limit
      }
      return messageFeed;
    }
  },
  Mutation: {
    addChannel: (root, args) => {
      const name = args.name
      addChannel(name);
      let newChannel = getChannel(lastChannelId);
      return newChannel;
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(channel => channel.id === (message.channelId));
      if(!channel)
        throw new Error("Channel does not exist");

      const newMessage = { id: String(lastMessageId++), text: message.text };
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
