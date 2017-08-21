import React, { Component } from 'react';
import MessageList from './MessageList';
import ChannelPreview from './ChannelPreview';
import NotFound from './NotFound';

import {
    gql,
    graphql,
} from 'react-apollo';

class ChannelDetails extends Component {
  componentWillMount() {
    this.props.data.subscribeToMore({
      document: messagesSubscription,
      variables: {
        channelId: this.props.match.params.channelId,
      },
      updateQuery: (prev, {subscriptionData}) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const newMessage = subscriptionData.data.messageAdded;

        // don't double add the message
        if (!prev.channel.messages.find((msg) => msg.id === newMessage.id)) {
          return Object.assign({}, prev, {
            channel: Object.assign({}, prev.channel, {
              messages: [...prev.channel.messages, newMessage],
            })
          });
        } else {
          return prev;
        }
      }
    })
  }

  render() {
    const { data: {loading, error, channel }, match, loadOlderMessages } = this.props;
    if (loading) {
      return <ChannelPreview channelId={match.params.channelId}/>;
    }
    if (error) {
      return <p>{error.message}</p>;
    }
    if(channel === null){
      return <NotFound />
    }
    return (
      <div>
      <div>
        <div className="channelName">
          {channel.name}
        </div>
        <MessageList messages={channel.messageFeed.messages}/>
      </div>
      <button onClick={loadOlderMessages}>
        Load More
      </button>
      </div>
    );
  }
}

export const channelDetailsQuery = gql`
  query ChannelDetailsQuery($channelId : ID!, $cursor: Int, $limit: Int) {
    channel(id: $channelId, cursor: $cursor, limit: $limit) {
      id
      name
      messageFeed(cursor: $cursor, limit: $limit) @connection(key: "messageFeed") {
        cursor
        messages {
          id
          text
        }
      }
    }
  }
`;

const messagesSubscription = gql`
  subscription messageAdded($channelId: ID!) {
    messageAdded(channelId: $channelId) {
      id
      text
    }
  }
`

export default (graphql(channelDetailsQuery, {
  options: (props) => ({
    variables: { 
      channelId: props.match.params.channelId,
      limit: 10
    },
  }),

  props: (props) => {
    return Object.assign(props, {
      loadOlderMessages: () => {
        return props.data.fetchMore({
          variables: {
            channelId: props.data.channel.id,
            cursor: props.data.channel.messageFeed.cursor,
            limit: 10
          },
          updateQuery(previousResult, { fetchMoreResult }) {
            const prevMessageFeed = previousResult.channel.messageFeed
            const newMessageFeed = fetchMoreResult.channel.messageFeed
            const newChannelData = Object.assign({}, previousResult.channel, {
                messageFeed: {
                  messages: [...newMessageFeed.messages, ...prevMessageFeed.messages],
                  cursor: newMessageFeed.cursor
                }
            });
            const newData =  {...previousResult, channel: newChannelData};
            return newData;
          }
        });
      }
    });
  }
})(ChannelDetails));
