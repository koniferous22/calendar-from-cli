export const CalendarLaneViewCurrentTimeMarker = () => {
  return (
    <>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-[var(--theme-color-font)] z-10 rounded" />
      </div>
      <hr className="h-[2px] border-t-[var(--theme-color-font)] bg-[var(--theme-color-font)] w-full rounded" />
    </>
  )
}
