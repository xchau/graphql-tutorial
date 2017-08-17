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
        console.log('prev.channel: ', prev.channel)
        if (!prev.channel.messages.find((msg) => msg.id === newMessage.id)) {
          return Object.assign({}, prev, {
            channel: Object.assign({}, prev.channel, {
              messages: [...prev.channel.messages, newMessage]
            })
          });
        } else {
          return prev;
        }
      }
    })
  }

  render() {
    console.log('this.props: ', this.props)
    const { data: {loading, error, channel }, match, loadMore } = this.props;
    console.log('channel: ', channel);
    console.log('loadMore: ', loadMore);
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
      <button onClick={loadMore}>
        Load More
      </button>
      </div>
    );
  }
}

export const channelDetailsQuery = gql`
  query ChannelDetailsQuery($channelId : ID!, $cursor: Int) {
    channel(id: $channelId, cursor: $cursor) {
      id
      name
      messageFeed(cursor: $cursor) {
        messages {
          id
          text
        }
      }
    }
  }
`;

const messagesSubscription = gql`
  subscription messageAdded($channelId: Int) {
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
      cursor: 8,
    },
  }),

  props: (props) => {
    console.log('props: ', props);
    return Object.assign(props, {
      loadMore: () => {
        return props.data.fetchMore({
          variables: {
            //channelId: props.match.params.channelId,
            channelId: props.data.channel.id ? props.data.channel.id : props.match.params.channelId, 
            cursor: 6
          },
          updateQuery(previousResult, { fetchMoreResult }) {
            console.log('previousResult ', previousResult)
            console.log('fetchMoreResult ', fetchMoreResult)
          }
        });
      }
    });
  }
})(ChannelDetails));
