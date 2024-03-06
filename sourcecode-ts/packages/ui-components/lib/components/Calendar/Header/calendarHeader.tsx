import { useEffect, useState } from 'react'
import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'
import _ from 'lodash'
import { Title } from '../../Title/title'
import { CalendarIcon } from '../../../icons/Calendar/calendar'
import { ViewSettingsBar } from '../../ViewSettingsBar/viewSettingsBar'
import { ChevronPrev } from '../../../icons/Chevron/Previous/chevronPrev'
import { ChevronNext } from '../../../icons/Chevron/Next/chevronNext'
import clsx from 'clsx'
import { useCalendarViewContext } from '../../../context/calendarView'
import { useLoaderContext } from '../../../hooks'
import { Spinner } from '../../Spinner/spinner'

type HeaderArrowPrevProps = {
  isDisabled?: boolean
  onPrev: () => void
}

const HeaderArrowPrev = ({ isDisabled, onPrev }: HeaderArrowPrevProps) => {
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrev()
      }
    }
    window.addEventListener('keydown', keyHandler)

    return () => {
      window.removeEventListener('keydown', keyHandler)
    }
  }, [onPrev])
  return (
    <div
      className={clsx('', {
        'cursor-pointer': !isDisabled,
      })}
      onClick={onPrev}
    >
      <ChevronPrev isDisabled={isDisabled} />
    </div>
  )
}

type HeaderArrowPrevProps2 = {
  isDisabled?: boolean
  onNext: () => void
}

const HeaderArrowNext = ({ isDisabled, onNext }: HeaderArrowPrevProps2) => {
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        onNext()
      }
    }
    window.addEventListener('keydown', keyHandler)

    return () => {
      window.removeEventListener('keydown', keyHandler)
    }
  }, [onNext])
  return (
    <div
      className={clsx('', {
        'cursor-pointer': !isDisabled,
      })}
      onClick={onNext}
    >
      <ChevronNext isDisabled={isDisabled} />
    </div>
  )
}

type CalendarListingLimits = {
  pastBrowsing:
    | {
        enabled: false
      }
    | {
        enabled: true
        lowerLimit: Date
      }
  futureBrowsingUpperLimit: Date
}

type Props = {
  title: string
  settingsBar: Omit<Parameters<typeof ViewSettingsBar>[0], 'isOpen' | 'onSettingsBarClose'>
  calendarListingLimits: CalendarListingLimits
  arrowKeyboardEventDebounce: number
  shouldDisplayLoaderAsHeaderIcon?: boolean
}

export const CalendarHeader = ({
  title,
  settingsBar,
  shouldDisplayLoaderAsHeaderIcon,
  calendarListingLimits,
  arrowKeyboardEventDebounce,
}: Props) => {
  const { isLoading } = useLoaderContext()
  const { utils, ctx, callbacks } = useCalendarViewContext()
  const { to: calendarIntervalTo } = utils.calendarRangeInterval
  const prevCalendarRangeIdentifier = calendarRangeIdentifier.prevCalendarRangeIdentifier(ctx.rangeView, utils.timezone)
  const isArrowPrevDisallowed = calendarListingLimits.pastBrowsing.enabled
    ? // validates if identifier is past the the threshold
      !calendarRangeIdentifier.validateCalendarRangeIdentifierNotPast(
        prevCalendarRangeIdentifier,
        utils.timezone,
        calendarListingLimits.pastBrowsing.lowerLimit,
      )
    : // validates if identifier is past the the threshold
      !calendarRangeIdentifier.validateCalendarRangeIdentifierNotPast(
        prevCalendarRangeIdentifier,
        utils.timezone,
        ctx.now,
      )
  const isArrowNextDisallowed = calendarIntervalTo > calendarListingLimits.futureBrowsingUpperLimit
  const handleArrowNextClick = _.debounce(() => {
    if (!isArrowNextDisallowed) {
      callbacks.setRangeView(calendarRangeIdentifier.nextCalendarRangeIdentifier(ctx.rangeView, utils.timezone))
    }
  }, arrowKeyboardEventDebounce)
  const handleArrowPrevClick = _.debounce(() => {
    if (!isArrowPrevDisallowed) {
      callbacks.setRangeView(calendarRangeIdentifier.prevCalendarRangeIdentifier(ctx.rangeView, utils.timezone))
    }
  }, arrowKeyboardEventDebounce)
  const [isSettingsBarOpen, setSettingsBarOpen] = useState<boolean>(false)
  const shouldDisplayLoader = shouldDisplayLoaderAsHeaderIcon && isLoading
  return (
    <>
      <ViewSettingsBar
        {...settingsBar}
        isOpen={isSettingsBarOpen}
        onSettingsBarClose={() => setSettingsBarOpen(false)}
      />
      <div className="flex items-center justify-between m-5 gap-3 sm:mb-10">
        <HeaderArrowPrev isDisabled={isArrowPrevDisallowed} onPrev={handleArrowPrevClick} />
        <div className="flex items-center gap-3">
          <div className="cursor-pointer" onClick={() => setSettingsBarOpen(true)}>
            {!shouldDisplayLoader && <CalendarIcon variant="standard" />}
            {shouldDisplayLoader && <Spinner size="medium" speed="fast" />}
          </div>
          <Title text={title} />
        </div>
        <HeaderArrowNext isDisabled={isArrowNextDisallowed} onNext={handleArrowNextClick} />
      </div>
    </>
  )
}
