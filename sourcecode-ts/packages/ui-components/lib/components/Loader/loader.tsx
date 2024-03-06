import { Spinner } from '../Spinner/spinner'

export const Loader = () => (
  <div className="fixed inset-0 bg-[var(--theme-color-background-section)] opacity-50 z-40">
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Spinner size="large" speed="fast" />
    </div>
  </div>
)
