import React from 'react';

import AddMessage from './AddMessage';

const MessageList = ({ messages }) => {
  console.log('in MessageList component')
  console.log('messages: ', messages)
  return (
    <div className="messagesList">
      { messages.map( message =>
        (<div key={message.id} className={'message ' + (message.id < 0 ? 'optimistic' : '')}>
            {message.text}
        </div>)
      )}
      <AddMessage />
    </div>
  );
};
export default (MessageList);
