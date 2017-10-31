import React from 'react';
import {
    gql,
    graphql,
} from 'react-apollo';

// import NotFound from './NotFound';

const ChannelPreview = ({ data: { loading, error, channel } }) => {
  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <div className="channelName">
        { channel ? channel.name : 'Loading...' }
      </div>
      <div>Loading Messages</div>
    </div>
  );
};

export const channelQuery = gql`
  query ChannelQuery($channelId: ID!) {
    channel(id: $channelId) {
      id
      name
    }
  }
`;

// export default (ChannelPreview);
export default (
  graphql(channelQuery, {
    options: (props) => ({
      variables: { channelId: props.channelId }
    })
  })(ChannelPreview)
);