import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { ThemeContext } from "./ThemeContext";
import { app_cfg } from "./app.cfg";

function AppNavbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const { dark, toggleTheme } = useContext(ThemeContext);
  const site_title = app_cfg.site_title;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/");
  };

  return (
    <Navbar className={dark ? "navbar bg-gradient-dark" : "navbar bg-gradient-light"} bg={dark ? "dark" : "light"} variant={dark ? "dark" : "light"} expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">{site_title}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {username ? (
              <Nav.Link as={Link} to="/users">Users</Nav.Link>
            ) : null}
            {username ? (
              <Nav.Link as={Link} to="/groups">Groups</Nav.Link>
            ) : null}

            {username ? (
              <NavDropdown title={username} id="user-dropdown" align="end">
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}

            {/* Bottone toggle tema */}
            <Button
              variant={dark ? "secondary" : "outline-secondary"}
              className="ms-2"
              onClick={toggleTheme}
            >
              {dark ? <i className="bi bi-sun"></i> : <i className="bi bi-moon"></i>}
            </Button>
          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}

export default AppNavbar;
