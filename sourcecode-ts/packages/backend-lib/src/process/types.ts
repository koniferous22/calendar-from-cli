import { queries } from '@calendar-from-cli/db-queries'

export type LoadedProcess = NonNullable<Awaited<ReturnType<typeof queries.findProcessById>>>
type LoadedProcessItemAttachment = LoadedProcess['ProcessItemAttachment'][number]
type LoadedProcessTemplate = NonNullable<Awaited<ReturnType<typeof queries.findProcessTemplateByAlias>>>
type LoadedProcessTemplateItem = LoadedProcessTemplate['ProcessTemplateItem'][number]

export type ProcessItem = LoadedProcessItemAttachment | LoadedProcessTemplateItem

export type ListedProcessSnapshots = Awaited<ReturnType<typeof queries.listHistoricProcessSnapshotsByIds>>
export type ListedProcessSnapshot = ListedProcessSnapshots[number]
