import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('ERREUR CAPTURÉE:', error.message);
    console.log('INFO:', info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', padding: 40 }}>
          <h1>Erreur : {this.state.error?.message}</h1>
        </div>
      );
    }
    return this.props.children;
  }
}