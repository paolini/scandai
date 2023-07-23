import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import package_json from '../package.json'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  return <Navbar bg="light" expand="lg">
    { false && JSON.stringify(session) }
    <Container>
      <Navbar.Brand href="/">{package_json.name}-{package_json.version}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/report">Report</Nav.Link>
          <Nav className="right">
          {!session && <NavDropdown title="user">
            <NavDropdown.Item
                href={`/api/auth/signin`}
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}>login
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
                <>
                  <NavDropdown.Item
                      href="/users"
                      onClick={(e) => {e.preventDefault(); router.push('/users')}}>
                        users
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    href="/dict"
                    onClick={(e) => {e.preventDefault(); router.push('/dict')}}>
                        mappature
                  </NavDropdown.Item>
                </>
                }
                <NavDropdown.Item
                    href={`/api/auth/signout`}
                    onClick={(e) => {
                      e.preventDefault()
                      signOut()
                    }}  
                  >logout
                </NavDropdown.Item>
            </NavDropdown>}
         </Nav>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
}