import clsx from 'clsx'

type Props = {
  isFullWidth?: boolean
  shouldIncludeYGap?: boolean
}

export const Hr = ({ isFullWidth, shouldIncludeYGap }: Props) => (
  <hr
    className={clsx('h-[1px] border-t-[var(--theme-color-background-input)] sm:mx-auto rounded', {
      'sm:w-[95%]': !isFullWidth,
      'my-3': shouldIncludeYGap,
    })}
  />
)
