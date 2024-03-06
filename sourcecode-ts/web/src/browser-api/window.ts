export const screenBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export const getScreenSizesGreaterThan = (referenceBreakpoint: keyof typeof screenBreakpoints) =>
  Object.entries(screenBreakpoints)
    .filter(([, breakpoint]) => breakpoint > screenBreakpoints[referenceBreakpoint])
    .map(([key]) => key)

// Note - for screens with width lower than 640, this function returns undefined
const resolveScreenSize = (screenSize: number) => {
  const sortedScreenBreakpoints = Object.entries(screenBreakpoints).sort(
    ([, value1], [, value2]) => value1 - value2,
  ) as [keyof typeof screenBreakpoints, number][]
  return sortedScreenBreakpoints.find(([, breakpoint]) => screenSize > breakpoint)?.[0]
}

export const resolveViewportScreenSize = () => resolveScreenSize(window.innerWidth)
