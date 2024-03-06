import type { AppRouter } from '../../../api/admin/src/index.js'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AwsClient } from 'aws4fetch'
import { getConfig } from './config'
import { createAwsAccessKeysSecretReader } from '@calendar-from-cli/secrets'

type FetchFn = NonNullable<Parameters<typeof httpBatchLink>[0]['fetch']>

const resolveFetchFn = (): FetchFn => {
  const fetchingOpts = getConfig().apiAdminFetchingOptions
  switch (fetchingOpts.apiAdminRuntime) {
    case 'serverless':
      if (fetchingOpts.shouldUseSignaturev4) {
        const awsAccessKeysReader = createAwsAccessKeysSecretReader(fetchingOpts.awsAccessKeySecretConfig)
        const awsAccessKeys = awsAccessKeysReader()
        const aws = new AwsClient({
          accessKeyId: awsAccessKeys.awsAccessKeyId,
          secretAccessKey: awsAccessKeys.awsSecretAccessKey,
          region: fetchingOpts.deployedApiAwsRegion,
          service: 'execute-api',
        })
        return async (url, options) => {
          // Note - AWS requires Signature v4 request in order to communicate with API gateway with IAM Authorizer
          // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-access-control-iam.html
          return aws.fetch(url.toString(), options)
        }
      }
      return fetch
    default:
      return fetch
  }
}

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getConfig().apiAdminUrl,
      fetch: resolveFetchFn(),
    }),
  ],
})
