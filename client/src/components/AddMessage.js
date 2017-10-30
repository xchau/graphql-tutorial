import React from 'react';
import { gql, graphql } from 'react-apollo';
import { channelDetailsQuery } from './ChannelDetails';
import { withRouter } from 'react-router';

const AddMessage = ({ match, mutate }) => {
  const handleKeyUp = (evt) => {
    if (evt.keyCode === 13) {
      evt.persist();
      mutate({
        variables: {
          message: {
            channelId: match.params.channelId,
            text: evt.target.value
          }
        },
        optimisticResponse: {
          addMessage: {
            id: Math.round(Math.random() * -1000000),
            text: evt.target.value,
            __typename: 'Message'
          }
        },
        update: (store, { data: { addMessage } }) => {
          // read data from cache for query
          const data = store.readQuery({
            query: channelDetailsQuery,
            variables: {
              channelId: match.params.channelId
            }
          });

          // add our message from mutation to data
          data.channel.messages.push(addMessage);

          // write data to cache
          store.writeQuery({
            query: channelDetailsQuery,
            variables: {
              channelId: match.params.channelId
            },
            data
          });
        }
      })
      .then(res => {
        evt.target.value = '';
      });
    }
  };

  return (
    <div className="messageInput">
      <input
        type="text"
        placeholder="New message"
        onKeyUp={handleKeyUp}
      />
    </div>
  );
};

const addMessageMutation = gql`
  mutation addMessage($message: MessageInput!) {
    addMessage(message: $message) {
      id
      text
    }
  }
`;

// export default withRouter(AddMessage);
const AddMessageWithMutation = graphql(
  addMessageMutation
)(withRouter(AddMessage));

export default AddMessageWithMutation;
