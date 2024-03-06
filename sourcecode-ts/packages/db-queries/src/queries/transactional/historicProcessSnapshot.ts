import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { Process } from '@prisma/client'

export const createHistoricProcessSnapshotFromProcess = async (
  pc: PrismaClientReusableInTransactions,
  sourceProcess: Process,
  now: Date,
) => {
  return pc.historicProcessSnapshot.create({
    data: {
      TakenAt: now,
      Title: sourceProcess.Title,
      Description: sourceProcess.Description,
      DescriptionFormat: sourceProcess.DescriptionFormat,
      ProtectedTitle: sourceProcess.ProtectedTitle,
      ProtectedDescription: sourceProcess.ProtectedDescription,
      ProtectedDescriptionFormat: sourceProcess.ProtectedDescriptionFormat,
      PublicTitle: sourceProcess.PublicTitle,
      PublicDescription: sourceProcess.PublicDescription,
      PublicDescriptionFormat: sourceProcess.PublicDescriptionFormat,
      OriginalStartsAtUTC: sourceProcess.StartsAtUTC,
      ProcessColor: sourceProcess.ProcessColor,
    },
  })
}

export const findHistoricProcessSnapshotById = async (pc: PrismaClientReusableInTransactions, id: number) => {
  return pc.historicProcessSnapshot.findUnique({
    where: {
      Id: id,
    },
  })
}
