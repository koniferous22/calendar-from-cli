import React from 'react'

type LaneHeaderItemProps = {
  children?: React.ReactNode
}

export const LaneViewHeaderItem = ({ children }: LaneHeaderItemProps) => {
  return <div className="h-[3rem] text-center">{children}</div>
}
