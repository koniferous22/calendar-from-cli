import fs, { existsSync } from 'fs'
import path from 'path'
import { program } from 'commander'
import chalk from 'chalk'
import { z } from 'zod'
import { trpcClient } from '../../sync-event-templates/src/trpc'
import { getConfigurables } from '../../sync-event-templates/src/configurables'
import { inferRouterInputs } from '@trpc/server'
import type { AppRouter } from '../../../api/admin/src'

type UpsertProcessTemplateInput = inferRouterInputs<AppRouter>['processTemplate']['upsert']

program
  .description('Synchronize event templates from JSON files with calendar admin API')
  .option('--remove-not-found-items')
  .option('--recurse-directories')
  .argument('<paths...>', 'FS entry to synchronize (directories are processed by processing files in them)')

program.parse()

const zOpts = z.object({
  removeNotFoundItems: z.optional(z.boolean()),
  recurseDirectories: z.optional(z.boolean()),
})

const opts = zOpts.parse(program.opts())

const processProcessTemplateFiles = (fps: string[]) => {
  const zUpsertProcessTemplateInput = getConfigurables().validators.apiInput.processTemplate.zUpsertProcessTemplateInput
  const filesWithError = [] as string[]
  const processTemplates = [] as UpsertProcessTemplateInput[]
  for (const processTemplateInputFile of fps) {
    const fileContents = fs.readFileSync(processTemplateInputFile, 'utf-8')
    const rawInput = JSON.parse(fileContents)
    const parsedProcessTemplateInput = zUpsertProcessTemplateInput.safeParse(rawInput)
    if (parsedProcessTemplateInput.success) {
      processTemplates.push(parsedProcessTemplateInput.data as UpsertProcessTemplateInput)
    } else {
      filesWithError.push(processTemplateInputFile)
    }
  }
  if (filesWithError.length > 0) {
    throw new Error(
      `Following fs entries don't have valid data: ${filesWithError.map((invalidData) => `"${invalidData}"`).join(', ')}`,
    )
  }
  return processTemplates
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
  return processProcessTemplateFiles(filePaths)
}

const main = async () => {
  const processTemplatesFromApi = await trpcClient.processTemplate.list.query()
  const processTemplateInputs = preprocessInputPaths(program.args)
  // @ts-expect-error type instantion is possibly infinite
  const processTemplatesFromApiNotPresentInFs = processTemplatesFromApi.filter(
    ({ Alias: aliasFromApi }) => !processTemplateInputs.find(({ fields }) => fields.alias === aliasFromApi),
  )
  if (opts.removeNotFoundItems && processTemplatesFromApiNotPresentInFs.length > 0) {
    console.info(chalk.red('Removing process templates'))
    console.info(
      chalk.red(
        processTemplatesFromApiNotPresentInFs.map((processTemplate) => `- ${processTemplate.Alias}`).join('\n'),
      ),
    )
    await Promise.all(
      processTemplatesFromApiNotPresentInFs.map((processTemplateToRemove) =>
        trpcClient.processTemplate.remove.mutate({
          alias: processTemplateToRemove.Alias,
        }),
      ),
    )
  }
  if (processTemplateInputs.length === 0) {
    console.info(chalk.yellow('No input process templates found'))
    return
  }
  console.info(chalk.yellow('Upserting process templates'))
  console.info(
    chalk.yellow(processTemplateInputs.map((processTemplate) => `- ${processTemplate.fields.alias}`).join('\n')),
  )
  await Promise.all(
    processTemplateInputs.map((processTemplateToAdd) => trpcClient.processTemplate.upsert.mutate(processTemplateToAdd)),
  )
}

main().catch(console.error)
