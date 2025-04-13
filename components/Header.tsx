import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import assert from 'assert'
import { useQuery } from '@apollo/client'

import package_json from '../package.json'
import { useTrans } from '@/lib/trans'
import { currentSchoolYear } from '@/lib/utils'
import { ProfileQuery } from '@/lib/api'
import Loading from './Loading'
import Error from './Error'

const Link = Nav.Link

export default function Header() {
  const {data, loading, error} = useQuery(ProfileQuery)
  const router = useRouter()
  const profile = data?.profile
  const isAdmin = profile?.isAdmin
  const isTeacher = profile?.isTeacher
  const isViewer = profile?.isViewer
  const isSuper = profile?.isSuper
  const isAuthenticated = !!profile
  const locale = router.locale || 'it'
  const _ = useTrans()
  const year = currentSchoolYear()

  if (loading) return <Loading />
  if (!data) return <Error>Impossibile caricare il profilo</Error>

  assert (locale === 'it' || locale === 'en' || locale === 'fu', 'locale non supportata')

  return <div className="noPrint"><Navbar bg="light" expand="lg">
    { false && JSON.stringify(profile) }
    <Container>
      <Navbar.Brand href="/">{package_json.name}-{package_json.version}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          { (isAdmin || isViewer) && <Link href={`/${locale}/report?year=${year}`}>
              {_("Database")}
            </Link> }
          { (isTeacher||isAdmin) && <Link href={`/${locale}/`}>
              {_("Questionari")}
            </Link> }
          { isAdmin && 
                <>
                  <Link className="admin" href={`/${locale}/users`}>{_("Utenti")}</Link>
                  <Link className="admin" href={`/${locale}/school`}>{_("Scuole")}</Link>
                  <Link className="admin" href={`/${locale}/dict`}>{_("Mappature")}</Link>
                  <Link className="admin" href={`/${locale}/translation`}>{_("Lingue")}</Link>
                </>
          }
          { isSuper &&
              <Link className="superadmin" href={`/${locale}/entries`}>{_("Entries")}</Link>
          }
          { !isAuthenticated && 
            <Link href="/api/auth/signin">{_("Login")}</Link>
          }
          <Nav className="right">
            <NavDropdown title={_({it: 'italiano', en: 'inglese', fu: 'friulano'}[locale])}>
              <NavDropdown.Item onClick={() => changeLocale('fu')}>
                {_("friulano")}
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLocale('it')}>
                {_("italiano")}
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLocale('en')}>
                {_("inglese")}
              </NavDropdown.Item>
            </NavDropdown>  
          </Nav>
          { isAuthenticated && 
          <Nav className="right">
          {!profile && <NavDropdown title="user">
            <NavDropdown.Item
                href={`/api/auth/signin`}
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}>{_("login")}
            </NavDropdown.Item>
          </NavDropdown>} 
          {profile && 
            /* user is authenticated */
            <NavDropdown title={<>
                {profile.image && 
                <img
                  src={profile.image}
                  className="rounded-circle"
                  width="22"
                  alt="Avatar"
                  loading="lazy"
                />}
                <span className="me-2">{profile.email || profile.username || '---'}</span>
              </>}>
                { isSuper && <NavDropdown.Item className="bg-danger" href={`/api/backup`}>
                    {_("download backup")}
                </NavDropdown.Item>}
                <NavDropdown.Item
                    href={`/api/auth/signout`}
                    onClick={async (e) => {
                      e.preventDefault()
                      await signOut()
                      // router.push('/') // non funziona!
                      window.location.href = '/'
                    }}  
                  >{_("logout")}
                </NavDropdown.Item>
            </NavDropdown>}
         </Nav>}
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar></div>

  function changeLocale(locale: 'it' | 'en' | 'fu') {
    router.push(router.asPath, undefined, { locale })
  }
}