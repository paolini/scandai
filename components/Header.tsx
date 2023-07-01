import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import package_json from '../package.json'
//import { name, version } from '../package.json'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const loading = status === "loading"

  return <Navbar bg="light" expand="lg">
    { false && JSON.stringify(session) }
    <Container>
      <Navbar.Brand href="/">{package_json.name}-{package_json.version}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/report">Report</Nav.Link>
          <Nav className="right">
          {!session && <NavDropdown title="admin">
            <NavDropdown.Item>
              <Nav.Link
                href={`/api/auth/signin`}
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}
                >login</Nav.Link>
            </NavDropdown.Item>
          </NavDropdown>} 
          {session && session.user &&
            /* user is authenticated */
            <NavDropdown title={<>
                {session.user.image && 
                <img
                  src={session.user.image}
                  className="rounded-circle"
                  width="22"
                  alt="Avatar"
                  loading="lazy"
                />}
                <span className="me-2">{session.user.email}</span>
              </>}>
                { session.dbUser?.isAdmin && 
                  <NavDropdown.Item>
                    <Nav.Link 
                      href="/users"
                      onClick={(e) => {e.preventDefault(); router.push('/users')}}
                      >users</Nav.Link>
                  </NavDropdown.Item>
                }
                <NavDropdown.Item>
                  <Nav.Link
                    href={`/api/auth/signout`}
                    onClick={(e) => {
                      e.preventDefault()
                      signOut()
                    }}  
                  >logout</Nav.Link>
                </NavDropdown.Item>
            </NavDropdown>}
         </Nav>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
}