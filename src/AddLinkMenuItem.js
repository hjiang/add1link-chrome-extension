/* global chrome */

import React, { Component } from 'react';
import { Menu, Icon, Loader } from 'semantic-ui-react';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const SAVE_LINK_MUTATION = gql`
  mutation SaveLinkMutation($url: String!, $title: String) {
    saveLink(url: $url, title: $title) {
      id
    }
  }
`;

class AddLinkMenuItem extends Component {
  state = {
    currentState: 'idle'
  }

  createApolloClient = () => {
    return new ApolloClient({
      uri: 'https://add1.link/graphql',
      request: (operation) => {
        return new Promise(resolve => {
          chrome.storage.local.get('token', result => {
            resolve(operation.setContext({
              headers: {
                authorization: result.token
              }
            }));
          });
        });
      },
    });
  }

  onClick = () => {
    this.setState({ currentState: 'loading' });
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
      const { url, title } = tabs[0];
      const client = this.createApolloClient();
      client.mutate({
        mutation: SAVE_LINK_MUTATION,
        variables: { url, title }
      }).then(() => {
        this.setState({ currentState: 'success' });
        setTimeout(() => {
          this.setState({ currentState: 'idle' });
        }, 3000);
      }).catch(() => {
        this.setState({ currentState: 'error' });
        setTimeout(() => {
          this.setState({ currentState: 'idle' });
        }, 5000);
      });
    });
  }
  render = () => {
    return (
      <Menu.Item name='add' disabled={this.state.currentState !== 'idle'} onClick={this.onClick} >
        Quick add this link
        {this.state.currentState === 'success' && <Icon name='check' color='green' />}
        {this.state.currentState === 'error' && <Icon name='close' color='red' />}
        {this.state.currentState === 'loading' && <Loader active inline size='tiny'
          style={{ marginLeft: '1em' }} />}
      </Menu.Item>
    );
  }
}

AddLinkMenuItem.propTypes = {
  token: PropTypes.string.isRequired
};

export default AddLinkMenuItem;
