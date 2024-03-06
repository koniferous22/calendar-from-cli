import { useState } from 'react'
import { useCalendarViewContext } from '../../../hooks'
import { Banner } from '../../Banner/banner'

const resolveTimezoneWarningBannerMessages = (
  timezoneView: ReturnType<typeof useCalendarViewContext>['ctx']['timezoneView'],
) => {
  let result: string[] = []
  if (timezoneView.type === 'custom') {
    result.push(
      `You're viewing the calendar in "${timezoneView.timezone}" - different timezone than detected on your device`,
    )
    result.push('(Adjust by switching in panel through calendar icon)')
  }
  return result
}

type Props = {
  errorBannerMessages: string[]
}

export const CalendarBanners = ({ errorBannerMessages }: Props) => {
  const { ctx } = useCalendarViewContext()
  const timezoneView = ctx.timezoneView
  const timezoneBannerMessages = resolveTimezoneWarningBannerMessages(timezoneView)
  const [errorBannerVisible, setErrorBannerVisible] = useState(errorBannerMessages.length > 0)
  const [timezoneBannerVisible, setTimezoneBannerVisible] = useState(timezoneBannerMessages.length > 0)
  return (
    <div className="m-3 flex flex-col gap-3">
      {timezoneBannerVisible && (
        <Banner
          variant="warning"
          message={timezoneBannerMessages.length > 1 ? timezoneBannerMessages : timezoneBannerMessages[0]}
          onCancel={() => setTimezoneBannerVisible(false)}
        />
      )}
      {errorBannerVisible && (
        <Banner
          variant="error"
          message={errorBannerMessages.length === 1 ? errorBannerMessages[0] : errorBannerMessages}
          onCancel={() => setErrorBannerVisible(false)}
        />
      )}
    </div>
  )
}
