import clsx from 'clsx'

type Props = {
  speed: 'slow' | 'standard' | 'fast'
  size: 'small' | 'medium' | 'large'
}

export const Spinner = ({ speed, size }: Props) => (
  <div
    className={clsx(
      'rounded-full border-[var(--theme-color-background-contrast-light)] border-t-[var(--theme-color-font)] animate-spin-fast',
      {
        'animate-spin-fast': speed === 'fast',
        'animate-spin-standard': speed === 'standard',
        'animate-spin-slow': speed === 'slow',
        'w-5': size === 'small',
        'h-5': size === 'small',
        'border-[3px]': size === 'small',
        'w-10': size === 'medium',
        'h-10': size === 'medium',
        'border-[5px]': size === 'medium',
        'w-20': size === 'large',
        'h-20': size === 'large',
        'border-[7px]': size === 'large',
      },
    )}
  />
)
