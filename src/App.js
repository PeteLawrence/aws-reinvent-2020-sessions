import './App.css';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import SessionsPage from './pages/SessionsPage';

import {
  HashRouter as Router,
  Switch,
  Route
} from 'react-router-dom';


function App() {
  return (
    <Container>
      <Router>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="#home">AWS re:invent 2020</Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

        </Navbar>

        <Switch>

          <Route exact path="/">
            <SessionsPage />
          </Route>

        </Switch>

      </Router>

    </Container>
  );
}

export default App;
