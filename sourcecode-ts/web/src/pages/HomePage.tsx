import { Outlet, useLocation } from 'react-router-dom'
import { CalendarPageRedirect } from '../redirects/CalendarPageRedirect'

export const HomePage = () => {
  const location = useLocation()
  const isRootRoute = location.pathname === '/'
  return (
    <>
      {isRootRoute && <CalendarPageRedirect />}
      {!isRootRoute && <Outlet />}
    </>
  )
}
