export const trustedViewerCalendarPermissionsOptions = [
  {
    value: 'canSeeTags',
    name: 'Should Viewer see assigned event tags?',
  },
  {
    value: 'canSeeProcessAssociations',
    name: 'Should Viewer see associations between events and processes?',
  },
  {
    value: 'canViewPast',
    name: 'Should Viewer be able to view past?',
  },
  {
    value: 'canSwitchToPublicView',
    name: 'Should Viewer have option to switch to public view on visit?',
  },
] as const

export const trustedViewerEventTagPermissionTypeOptions = [
  {
    value: 'allowList',
    name: 'Allow-list - i.e. implicit DENY + specify allowed exceptions',
  },
  {
    value: 'denyList',
    name: 'Deny-list - i.e. implicit ALLOW + specify denied exceptions',
  },
] as const
