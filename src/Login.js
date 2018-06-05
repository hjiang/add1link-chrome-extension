/* global chrome */
import React, { Component } from 'react';
import { Container, Form, Message, Header } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        email
      }
    }
  }
`;

class Login extends Component {
  state = {
    requestInFlight: false,
    errorReason: null
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit = () => {
    this.setState({ requestInFlight: true });
    const { email, password } = this.state;

    const client = new ApolloClient({
      uri: 'https://add1.link/graphql'
    });
    client.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password }
    }).then(result => {
      const { token, user } = result.data.login;
      chrome.storage.local.set({ token, email: user.email }, () => {
        this.setState({ requestInFlight: false });
        this.props.afterLogin({ user, token });
      });
    }).catch(err => {
      this.setState({
        requestInFlight: false,
        errorReason: err.message  // FIXME: make friendly
      });
    });
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  render() {
    return (
      <Container>
        <Header as="h1">Login</Header>
        <Form onSubmit={this.handleSubmit} error={!!this.state.errorReason}>
          <Form.Input label="Email" name="email" onChange={this.handleChange} />
          <Form.Input label="Password" name="password" type="password"
            onChange={this.handleChange} />
          {this.state.errorReason && <Message error content={this.state.errorReason} />}
          <Form.Button primary loading={this.state.requestInFlight} type="submit">Submit</Form.Button>
        </Form>
        <p>Need an account? <a href="https://add1.link/sign-up" rel="noopener noreferrer" target="_blank">Sign up</a>.</p>
      </Container>
    );
  }
}

Login.propTypes = {
  afterLogin: PropTypes.func.isRequired,
};

export default Login;
