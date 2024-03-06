import { AwsClient } from 'aws4fetch'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../api/admin/src/index'
import { adminApiUrl, awsAccessKey, awsSecretAccessKey } from './envVariables'
import { getConfig } from './config'

type FetchFn = NonNullable<Parameters<typeof httpBatchLink>[0]['fetch']>

const resolveFetchFn = (): FetchFn => {
  const fetchingOpts = getConfig().apiAdminFetchingOptions
  switch (fetchingOpts.apiAdminRuntime) {
    case 'serverless':
      if (fetchingOpts.shouldUseSignaturev4) {
        const aws = new AwsClient({
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretAccessKey,
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

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: adminApiUrl,
      fetch: resolveFetchFn(),
    }),
  ],
})
