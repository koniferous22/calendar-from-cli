import clsx from 'clsx'
import { Tooltip } from '../Tooltip/Generic/genericTooltip'
import { CalendarEventInfoModal } from '../Modal/CalendarEventInfo/calendarEventInfoModal'
import { useModalState } from '../../hooks/useModalState'
import { CalendarEventShortLaneViewInfo } from './ShortLaneViewInfo/calendarEventDisplayedLaneViewInfo'
import { useCalendarEventContext } from '../../context/calendarEvent'
import { useCalendarViewContext } from '../../context/calendarView'

type TooltipDirection = Parameters<typeof Tooltip>[0]['direction']

type Props = {
  isBlurred?: boolean
  isDampened?: boolean
  isEventInfoModalEnabled?: boolean
  eventTagOptions: {
    displayOptions: 'corner' | 'center' | 'hide'
    tooltipDirection: TooltipDirection
  }
  trimmingOptions: {
    isTrimmedAtStart: boolean
    isTrimmedAtEnd: boolean
  }
  shortEventInfo: {
    type: Parameters<typeof CalendarEventShortLaneViewInfo>[0]['type']
    smType: Parameters<typeof CalendarEventShortLaneViewInfo>[0]['type']
    subtitle: string
  }
  eventTooltip: {
    isEnabled?: boolean
    tooltipDirection: TooltipDirection
    content: string | string[]
  }
}

export const CalendarEvent = ({
  isBlurred,
  isDampened,
  isEventInfoModalEnabled,
  eventTooltip,
  eventTagOptions,
  trimmingOptions,
  shortEventInfo,
}: Props) => {
  const { ctx } = useCalendarViewContext()
  const { title, eventTag } = useCalendarEventContext()
  const { modalState, openModalHandler, closeModalHandler } = useModalState()
  const isLaneView = ctx.rangeView.type === 'dayLaneView' || ctx.rangeView.type === 'weekLaneView'
  const isCellView = ctx.rangeView.type === 'monthCellView'
  const smTag = eventTag && eventTagOptions.displayOptions !== 'hide' && (
    <div
      className="rounded-full w-[10px] h-[10px]"
      style={{
        backgroundColor: eventTag.color,
      }}
    />
  )
  const tag = eventTag && eventTagOptions.displayOptions !== 'hide' && (
    <div
      className={clsx('cursor-pointer', {
        'mr-[5px]': isCellView,
        absolute: isLaneView,
        'top-[15px]': isLaneView,
        'right-[15px]': isLaneView,
      })}
    >
      <div className="sm:hidden">{smTag}</div>
      <div className="hidden sm:block">
        <Tooltip
          content={`"${eventTag.alias}" event tag`}
          shouldCenterOnSecondaryAxis
          direction={eventTagOptions.tooltipDirection}
          minWidth={200}
          isDampened={isDampened}
        >
          {smTag}
        </Tooltip>
      </div>
    </div>
  )
  const smEvent = (
    <div
      className={clsx('w-full h-full flex items-center overflow-hidden text-ellipsis', {
        'px-2': isCellView,
        'bg-[var(--theme-color-item-main)]': isCellView && !isDampened,
        'bg-[var(--theme-color-item-comain)]': isCellView && isDampened,
        'text-sm': isCellView,
        'sm:text-normal': isCellView,
        'cursor-pointer': !isBlurred && isEventInfoModalEnabled,
        'text-[var(--theme-color-font-disabled)]': isDampened,
        relative: isLaneView,
        'bg-event': isLaneView && !isDampened,
        'bg-event-past': isLaneView && isDampened,
        'justify-center': isLaneView,
        rounded: !trimmingOptions.isTrimmedAtStart && !trimmingOptions.isTrimmedAtEnd,
        'rounded-t': isLaneView && !trimmingOptions.isTrimmedAtStart && trimmingOptions.isTrimmedAtEnd,
        'rounded-b': isLaneView && trimmingOptions.isTrimmedAtStart && !trimmingOptions.isTrimmedAtEnd,
        'rounded-l': isCellView && !trimmingOptions.isTrimmedAtStart && trimmingOptions.isTrimmedAtEnd,
        'rounded-r': isCellView && trimmingOptions.isTrimmedAtStart && !trimmingOptions.isTrimmedAtEnd,
      })}
      onClick={isEventInfoModalEnabled ? openModalHandler : undefined}
    >
      {isLaneView && (
        <>
          <div className="sm:hidden">
            <CalendarEventShortLaneViewInfo
              type={shortEventInfo.type}
              title={title}
              subtitle={shortEventInfo.subtitle}
            />
          </div>
          <div className="hidden sm:block">
            <CalendarEventShortLaneViewInfo
              type={shortEventInfo.smType}
              title={title}
              subtitle={shortEventInfo.subtitle}
            />
          </div>
        </>
      )}
      {isCellView && <div className="grow overflow-hidden text-ellipsis whitespace-nowrap">{title}</div>}
      {tag}
    </div>
  )
  let event = smEvent
  if (eventTooltip.isEnabled) {
    let eventTooltipContent = Array.isArray(eventTooltip.content) ? eventTooltip.content : [eventTooltip.content]
    if (isEventInfoModalEnabled) {
      eventTooltipContent = eventTooltipContent.concat('(click for details)')
    }
    event = (
      <Tooltip
        content={eventTooltipContent}
        shouldCenterOnSecondaryAxis
        direction={eventTooltip.tooltipDirection}
        minWidth={200}
        isDampened={isDampened}
      >
        {smEvent}
      </Tooltip>
    )
  }
  return (
    <>
      {isEventInfoModalEnabled && (
        <CalendarEventInfoModal modalState={modalState} onModalClose={closeModalHandler} now={ctx.now} />
      )}
      <div
        className={clsx('sm:hidden w-full h-full', {
          'blur-sm': isBlurred,
        })}
      >
        {smEvent}
      </div>
      <div
        className={clsx('hidden sm:block w-full h-full ', {
          'blur-sm': isBlurred,
        })}
      >
        {event}
      </div>
    </>
  )
}
