import { z } from 'zod'
import { UniversalConfig } from '../../../config/universal.js'
import { createZLimitedString } from '../../../primitives/configurable/string.js'
import { zEncodedHexColor } from '../../../utils/hexColor.js'

const createZEventTagAlias = (maxEventTagAliasLength: number) => createZLimitedString(maxEventTagAliasLength)

export const createZUpsertEventTagInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTagAlias(inputValidation.stringLimits.eventTag.maxEventTagAliasLength),
    color: zEncodedHexColor,
  })

export const createZRemoveEventTagInput = ({ inputValidation }: UniversalConfig) =>
  z.object({
    alias: createZEventTagAlias(inputValidation.stringLimits.eventTag.maxEventTagAliasLength),
  })
