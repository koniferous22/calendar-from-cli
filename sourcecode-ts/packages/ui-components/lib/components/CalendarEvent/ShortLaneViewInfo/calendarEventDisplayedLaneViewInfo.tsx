type CalendarEventDisplayedInfoType = 'nothing' | 'titleOnly' | 'all'

type Props = {
  type: CalendarEventDisplayedInfoType
  title: string
  subtitle: string
}

export const CalendarEventShortLaneViewInfo = (props: Props) => {
  let content: React.ReactNode
  switch (props.type) {
    case 'nothing':
      return null
    case 'titleOnly':
      content = <div className="grow overflow-hidden text-ellipsis text-center max-w-full">{props.title}</div>
      break
    case 'all':
      content = (
        <>
          <div className="grow overflow-hidden text-ellipsis text-center max-w-full">{props.title}</div>
          <div className="text-sm overflow-hidden text-ellipsis text-center max-w-full">{props.subtitle}</div>
        </>
      )
      break
  }
  return <div className="grow flex flex-col items-center max-w-full">{content}</div>
}
