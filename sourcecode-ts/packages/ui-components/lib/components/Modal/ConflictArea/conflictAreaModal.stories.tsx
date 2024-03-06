import type { Meta, StoryObj } from '@storybook/react'

import { ConflictAreaModal } from './conflictAreaModal'
import { useModalState } from '../../../hooks/useModalState'
import { useEffect } from 'react'
import { commonTimestamps, timezone } from '../../../storybook-utils/constants'
import { createCalendarViewCtx } from '../../../storybook-utils/ctxOptions'
import { withCalendarView, withConflictArea } from '../../../storybook-utils/hoc'

const meta: Meta<typeof ConflictAreaModal> = {
  component: ConflictAreaModal,
}

export default meta
type Story = StoryObj<typeof ConflictAreaModal>

type Props = Parameters<typeof ConflictAreaModal>[0]
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
const exampleBegin = new Date(
  (function () {
    const x = new Date()
    x.setHours(12)
    x.setMinutes(45)
    x.setSeconds(0)
    x.setMilliseconds(0)
    return x
  })(),
)
const exampleEnd = new Date(
  (function () {
    const x = new Date()
    x.setHours(15)
    x.setMinutes(0)
    x.setSeconds(0)
    x.setMilliseconds(0)
    return x
  })(),
)

const calendarViewCtx = createCalendarViewCtx({
  now: commonTimestamps.now,
  rangeViewType: 'dayLaneView',
  timezones: {
    ownerTimezone: timezone,
    clientTimezone: timezone,
    initialTimezoneView: {
      type: 'ownerTimezone',
    },
  },
})

const generateEvents = (count: number) =>
  Array(count)
    .fill(null)
    .map((_, index) => ({
      title: `Example Event ${index + 1}`,
      eventInfo: {
        type: 'basic',
        description: 'Example Description',
        descriptionFormat: 'Plaintext',
      },
      startsAt: exampleBegin,
      endsAt: exampleEnd,
      now: commonTimestamps.now,
      isConcealed: false,
      duration: 60,
    }))

const RenderConflictAreaModal = ({ modalState: modalStateProp }: Props) => {
  const { modalState, openModalHandler, closeModalHandler } = useModalState()
  useEffect(() => {
    if (modalStateProp === 'open') {
      openModalHandler()
    } else if (modalStateProp === 'closed') {
      closeModalHandler()
    }
  }, [modalStateProp])
  return <ConflictAreaModal modalState={modalState} onModalClose={closeModalHandler} />
}

export const Primary: Story = {
  args: {
    modalState: 'open',
  },
  render: withCalendarView(
    calendarViewCtx,
    withConflictArea(
      {
        conflictAreaStartsAt: exampleBegin,
        conflictAreaEndsAt: exampleEnd,
        events: generateEvents(2) as any,
      },
      RenderConflictAreaModal,
    ),
  ),
}

export const ALotOfConflict: Story = {
  ...Primary,
  args: {
    ...Primary.args,
  },
  render: withCalendarView(
    calendarViewCtx,
    withConflictArea(
      {
        conflictAreaStartsAt: exampleBegin,
        conflictAreaEndsAt: exampleEnd,
        events: generateEvents(7) as any,
      },
      RenderConflictAreaModal,
    ),
  ),
}
