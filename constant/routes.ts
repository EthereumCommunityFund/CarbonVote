interface Route{
  name: string,
  path: string,
}

export const navBarRoutes: Route[] = [
  {
    name: 'LandingPage',
    path: '/',
  },
  {
    name: 'MyPolls',
    path: '/mypolls'
  }
]