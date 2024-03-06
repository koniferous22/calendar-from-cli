import type { Meta, StoryObj } from '@storybook/react'
import type { types } from '@calendar-from-cli/validation-lib'

import { CalendarEventInfoModal } from './calendarEventInfoModal'
import { useModalState } from '../../../hooks/useModalState'
import { useEffect } from 'react'
import { useCalendarEventContext } from '../../../context/calendarEvent'
import { withCalendarEvent } from '../../../storybook-utils/hoc'
import { commonTimestamps } from '../../../storybook-utils/constants'

const meta: Meta<typeof CalendarEventInfoModal> = {
  component: CalendarEventInfoModal,
}

export default meta
type Story = StoryObj<typeof CalendarEventInfoModal>

type Props = Parameters<typeof CalendarEventInfoModal>[0]

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

const exampleRecurringSchedule: types.RecurringEventScheduleSpec = {
  hour: 12,
  minute: 45,
  repeatsEvery: 1,
  dayRecurrence: {
    type: 'weeklySelectDays',
    days: [1, 3, 5],
  },
}

type CalendarEvent = ReturnType<typeof useCalendarEventContext>

const basicPlaintextEvent: CalendarEvent = {
  startsAt: exampleBegin,
  endsAt: exampleEnd,
  title: 'Example event',
  eventInfo: {
    type: 'basic',
    description: 'Example description',
    descriptionFormat: 'Plaintext',
  },
  eventTag: null,
  isConcealed: false,
  duration: 50,
}

const basicMarkdownEvent: CalendarEvent = {
  ...basicPlaintextEvent,
  eventInfo: {
    type: 'basic',
    description: '# Hello From Markdown\n## Hope that this works\n\n* Bullet point 1\n* Bullet point 2\n',
    descriptionFormat: 'Markdown',
  },
}

const processSnapshotEvent: CalendarEvent = {
  ...basicPlaintextEvent,
  eventInfo: {
    type: 'processSnapshot' as const,
    description: 'Example description',
    descriptionFormat: 'Plaintext',
    processTitle: 'Example Process',
    processItemsCompleted: 5,
  },
}

const recurringEvent: CalendarEvent = {
  ...basicPlaintextEvent,
  eventInfo: {
    type: 'recurringEvent' as const,
    description: 'Example description',
    descriptionFormat: 'Plaintext',
    recurringSchedule: exampleRecurringSchedule,
  },
}

const processEvent: CalendarEvent = {
  ...basicPlaintextEvent,
  eventInfo: {
    description: 'Example description',
    descriptionFormat: 'Plaintext',
    type: 'ongoingProcess' as const,
    eventIndexInProcess: 9,
    processItemsCompleted: 7,
    processEventCount: 11,
    processTitle: 'Example complicated process',
    processStartsAtUTC: commonTimestamps.yesterday,
  },
}

const RenderEventInfoModal = ({ modalState: modalStateProp }: Props) => {
  const { modalState, openModalHandler, closeModalHandler } = useModalState()
  useEffect(() => {
    if (modalStateProp === 'open') {
      openModalHandler()
    } else if (modalStateProp === 'closed') {
      closeModalHandler()
    }
  }, [modalStateProp])
  return <CalendarEventInfoModal modalState={modalState} onModalClose={closeModalHandler} now={commonTimestamps.now} />
}

export const BasicPlaintext: Story = {
  args: {
    modalState: 'open',
    now: commonTimestamps.now,
  },
  render: withCalendarEvent(basicPlaintextEvent, RenderEventInfoModal),
}

export const BasicMarkdown: Story = {
  ...BasicPlaintext,
  render: withCalendarEvent(basicMarkdownEvent, RenderEventInfoModal),
}

export const ProcessSnapshot: Story = {
  ...BasicPlaintext,
  render: withCalendarEvent(processSnapshotEvent, RenderEventInfoModal),
}

export const RecurringEvent: Story = {
  ...BasicPlaintext,
  render: withCalendarEvent(recurringEvent, RenderEventInfoModal),
}

export const Process: Story = {
  ...BasicPlaintext,
  render: withCalendarEvent(processEvent, RenderEventInfoModal),
}
