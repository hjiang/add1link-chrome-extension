/* global chrome */

import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import Login from './Login';
import AddLinkMenuItem from './AddLinkMenuItem';

class App extends Component {
  state = {
    email: null,
    token: null,
    loading: false
  }

  constructor(props) {
    super(props);
    this.setState({ loading: true });
    chrome.storage.local.get(['email', 'token'], (items) => {
      const { email, token } = items;
      this.setState({ email, token, loading: false });
    });
  }

  afterLogin = ({ user, token }) => {
    this.setState({ email: user.email, token });
  }

  logout = () => {
    chrome.storage.local.clear(() => {
      this.setState({
        email: null,
        token: null
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <p>Loading ...</p>;
    }
    if (!this.state.token) {
      return <Login afterLogin={this.afterLogin} />;
    }
    return (
      <Menu vertical style={{ width: '100%' }}>
        <Menu.Item>
          <Menu.Menu>
            <AddLinkMenuItem token={this.state.token} />
          </Menu.Menu>
        </Menu.Item>
        <Menu.Item>
          <Menu.Header>{this.state.email}</Menu.Header>
          <Menu.Menu>
            <Menu.Item name='logout' onClick={this.logout}>
              Logout
            </Menu.Item>
          </Menu.Menu>
        </Menu.Item>
      </Menu>
    );
  }
}

export default App;
