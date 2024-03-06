import fs, { existsSync } from 'fs'
import path from 'path'
import { program } from 'commander'
import chalk from 'chalk'
import { z } from 'zod'
import { trpcClient } from './trpc'
import { getConfigurables } from './configurables'
import { inferRouterInputs } from '@trpc/server'
import type { AppRouter } from '../../../api/admin/src'

type UpsertEventTemplateInput = inferRouterInputs<AppRouter>['eventTemplate']['upsert']

program
  .description('Synchronize process templates from JSON files with calendar admin API')
  .option('--remove-not-found-items')
  .option('--recurse-directories')
  .argument('<paths...>', 'FS entry to synchronize (directories are processed by processing files in them)')

program.parse()

const zOpts = z.object({
  removeNotFoundItems: z.optional(z.boolean()),
  recurseDirectories: z.optional(z.boolean()),
})

const opts = zOpts.parse(program.opts())

const processEventTemplateFiles = (fps: string[]) => {
  const zUpsertEventTemplateInput = getConfigurables().validators.apiInput.eventTemplate.zUpsertEventTemplateInput
  const filesWithError = [] as string[]
  const eventTemplates = [] as UpsertEventTemplateInput[]
  for (const eventTemplateInputFile of fps) {
    const fileContents = fs.readFileSync(eventTemplateInputFile, 'utf-8')
    const rawInput = JSON.parse(fileContents)
    const parsedEventTemplateInput = zUpsertEventTemplateInput.safeParse(rawInput)
    if (parsedEventTemplateInput.success) {
      eventTemplates.push(rawInput as UpsertEventTemplateInput)
    } else {
      filesWithError.push(eventTemplateInputFile)
    }
  }
  if (filesWithError.length > 0) {
    throw new Error(
      `Following fs entries don't have valid data: ${filesWithError.map((invalidData) => `"${invalidData}"`).join(', ')}`,
    )
  }
  return eventTemplates
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
  return processEventTemplateFiles(filePaths)
}

const main = async () => {
  const eventTemplatesFromApi = await trpcClient.eventTemplate.list.query()
  const eventTemplateInputs = preprocessInputPaths(program.args)
  // @ts-expect-error type instantion is possibly infinite
  const eventTemplatesFromApiNotPresentInFs = eventTemplatesFromApi.filter(
    ({ Alias: aliasFromApi }) => !eventTemplateInputs.find(({ alias: aliasFromFs }) => aliasFromFs === aliasFromApi),
  )
  if (opts.removeNotFoundItems && eventTemplatesFromApiNotPresentInFs.length > 0) {
    console.info(chalk.red('Removing event templates'))
    console.info(
      chalk.red(eventTemplatesFromApiNotPresentInFs.map((eventTemplate) => `- ${eventTemplate.Alias}`).join('\n')),
    )
    await Promise.all(
      eventTemplatesFromApiNotPresentInFs.map((eventTemplateToRemove) =>
        trpcClient.eventTemplate.remove.mutate({
          alias: eventTemplateToRemove.Alias,
        }),
      ),
    )
  }
  if (eventTemplateInputs.length === 0) {
    console.info(chalk.yellow('No input event templates found'))
    return
  }
  console.info(chalk.yellow('Upserting event templates'))
  console.info(chalk.yellow(eventTemplateInputs.map((eventTemplate) => `- ${eventTemplate.alias}`).join('\n')))
  await Promise.all(
    eventTemplateInputs.map((eventTemplateToAdd) => trpcClient.eventTemplate.upsert.mutate(eventTemplateToAdd)),
  )
}

main().catch(console.error)
