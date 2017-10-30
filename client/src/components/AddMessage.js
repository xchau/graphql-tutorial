import React from 'react';
import { gql, graphql } from 'react-apollo';
import { channelDetailsQuery } from './ChannelDetails';
import { withRouter } from 'react-router';

const AddMessage = ({ match }) => {
  const handleKeyUp = (evt) => {
    if (evt.keyCode === 13) {
      console.log(evt.target.value);
      evt.target.value = '';
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

export default withRouter(AddMessage);
