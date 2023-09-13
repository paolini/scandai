import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import package_json from '../package.json'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  return <div className="noPrint"><Navbar bg="light" expand="lg">
    { false && JSON.stringify(session) }
    <Container>
      <Navbar.Brand href="/">{package_json.name}-{package_json.version}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          { session?.dbUser?.isAdmin && <Nav.Link href="/report">Report</Nav.Link> }
          { session?.dbUser && <Nav.Link href="/">Questionari</Nav.Link> }
          { session?.dbUser?.isAdmin && 
                <>
                  <Nav.Link href="/users">Utenti</Nav.Link>
                  <Nav.Link href="/school">Scuole</Nav.Link>
                  <Nav.Link href="/dict">Mappature</Nav.Link>
                </>
          }
          { !(session?.dbUser) && 
            <Nav.Link href="/api/auth/signin">Login</Nav.Link>
          }
          { session?.dbUser && 
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
          {session && session?.dbUser &&
            /* user is authenticated */
            <NavDropdown title={<>
                {session.user?.image && 
                <img
                  src={session.user.image}
                  className="rounded-circle"
                  width="22"
                  alt="Avatar"
                  loading="lazy"
                />}
                <span className="me-2">{session.dbUser.email || session.dbUser.username || '---'}</span>
              </>}>
                <NavDropdown.Item
                    href={`/api/auth/signout`}
                    onClick={async (e) => {
                      e.preventDefault()
                      await signOut()
                      // router.push('/') // non funziona!
                      window.location.href = '/'
                    }}  
                  >logout
                </NavDropdown.Item>
            </NavDropdown>}
         </Nav>}
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar></div>
}