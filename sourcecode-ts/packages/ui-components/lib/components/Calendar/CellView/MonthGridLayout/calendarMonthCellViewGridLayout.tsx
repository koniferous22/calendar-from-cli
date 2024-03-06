type WeekGridLayoutProps = {
  children?: React.ReactNode
}

export const WeekGridLayout = ({ children }: WeekGridLayoutProps) => {
  return <div className="grid grid-cols-7">{children}</div>
}
