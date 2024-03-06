import fs, { existsSync } from 'fs'
import path from 'path'
import { program } from 'commander'
import chalk from 'chalk'
import { z } from 'zod'
import { trpcClient } from './trpc'
import { getConfigurables } from './configurables'
import { inferRouterInputs } from '@trpc/server'
import type { AppRouter } from '../../../api/admin/src'

type UpsertEventTagInput = inferRouterInputs<AppRouter>['eventTag']['upsert']

program
  .description('Synchronize event tags from JSON files with calendar admin API')
  .option('--remove-not-found-items')
  .option('--recurse-directories')
  .argument('<paths...>', 'FS entry to synchronize (directories are processed by processing files in them)')

program.parse()

const zOpts = z.object({
  removeNotFoundItems: z.optional(z.boolean()),
  recurseDirectories: z.optional(z.boolean()),
})

const opts = zOpts.parse(program.opts())

const processEventTagFiles = (fps: string[]) => {
  const zUpsertEventTagInput = getConfigurables().validators.apiInput.eventTag.zUpsertEventTagInput
  const filesWithError = [] as string[]
  const eventTags = [] as UpsertEventTagInput[]
  for (const eventTagInputFile of fps) {
    const fileContents = fs.readFileSync(eventTagInputFile, 'utf-8')
    const rawInput = JSON.parse(fileContents)
    const parsedEventTagInput = zUpsertEventTagInput.safeParse(rawInput)
    if (parsedEventTagInput.success) {
      eventTags.push(rawInput as UpsertEventTagInput)
    } else {
      filesWithError.push(eventTagInputFile)
    }
  }
  if (filesWithError.length > 0) {
    throw new Error(
      `Following fs entries don't have valid data: ${filesWithError.map((invalidData) => `"${invalidData}"`).join(', ')}`,
    )
  }
  return eventTags
}

const preprocessInputPaths = (fps: string[]) => {
  const validFilesystemPaths = [] as { fp: string; fpStat: fs.Stats }[]
  const notFound = [] as string[]
  const notReadable = [] as string[]
  for (const fp of fps) {
    if (!existsSync(fp)) {
      notFound.push(fp)
      continue
    }
    const fpStat = fs.lstatSync(fp)
    const isDirectory = fpStat.isDirectory()
    if (!isDirectory && !(fpStat.mode & fs.constants.R_OK)) {
      notReadable.push(fp)
      continue
    }
    validFilesystemPaths.push({
      fp,
      fpStat,
    })
  }
  if (notFound.length > 0 || notReadable.length > 0) {
    const notFoundErrorMessage =
      notFound.length > 0 ? `Following fs entries were not found: ${notFound.map((nf) => `"${nf}"`).join(', ')}\n` : ''
    const notReadableErrorMessage =
      notReadable.length > 0
        ? `Following fs entries don't have READ permission: ${notReadable.map((nr) => `"${nr}"`).join(', ')}\n`
        : ''
    throw new Error(`${notFoundErrorMessage}${notReadableErrorMessage}`)
  }
  const filePaths = validFilesystemPaths.flatMap(({ fp, fpStat }) => {
    if (!fpStat.isDirectory()) {
      return [fp]
    }
    const directoryEntries = fs.readdirSync(fp, {
      recursive: opts.recurseDirectories,
    })
    const directoryFiles = directoryEntries.filter((directoryEntry) =>
      fs.lstatSync(path.join(fp, directoryEntry.toString())).isFile(),
    )
    return directoryFiles.map((directoryFile) => path.join(fp, directoryFile.toString()))
  })
  return processEventTagFiles(filePaths)
}

const main = async () => {
  const eventTagsFromApi = await trpcClient.eventTag.list.query()
  const eventTagInputs = preprocessInputPaths(program.args)
  const eventTagsFromApiNotPresentInFs = eventTagsFromApi.filter(
    ({ Alias: aliasFromApi }) => !eventTagInputs.find(({ alias: aliasFromFs }) => aliasFromFs === aliasFromApi),
  )
  if (opts.removeNotFoundItems && eventTagsFromApiNotPresentInFs.length > 0) {
    console.info(chalk.red('Removing event tags'))
    console.info(chalk.red(eventTagsFromApiNotPresentInFs.map((eventTag) => `- ${eventTag.Alias}`).join('\n')))
    await Promise.all(
      eventTagsFromApiNotPresentInFs.map((eventTagToRemove) =>
        trpcClient.eventTag.remove.mutate({
          alias: eventTagToRemove.Alias,
        }),
      ),
    )
  }
  if (eventTagInputs.length === 0) {
    console.info(chalk.yellow('No input event tags found'))
    return
  }
  console.info(chalk.yellow('Upserting event tags'))
  console.info(chalk.yellow(eventTagInputs.map((eventTag) => `- ${eventTag.alias}`).join('\n')))
  await Promise.all(eventTagInputs.map((eventTagToAdd) => trpcClient.eventTag.upsert.mutate(eventTagToAdd)))
}

main().catch(console.error)
