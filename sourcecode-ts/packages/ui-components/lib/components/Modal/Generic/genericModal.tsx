import React from 'react'
import { TimesIcon } from '../../../icons/Times/times'
import clsx from 'clsx'
import { useModalState } from '../../../hooks/useModalState'

type Props = {
  modalState: ReturnType<typeof useModalState>['modalState']
  onClose: () => void
  children: React.ReactNode
  shouldDisallowClosing?: boolean
  size: 'medium' | 'large'
}

export const GenericModal = ({ modalState, onClose, children, shouldDisallowClosing, size }: Props) => {
  const closeHandler = shouldDisallowClosing ? undefined : onClose

  const isOpen = modalState === 'open'
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--theme-color-background-section)] opacity-50 z-40"
          onClick={closeHandler}
        />
      )}
      <div
        className={clsx(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 z-50 transition-all max-h-screen overflow-y-scroll no-scrollbar',
          {
            'opacity-0': !isOpen,
            'opacity-100': isOpen,
            'sm:w-1/3': size === 'medium',
            'sm:max-w-[500px]': size === 'medium',
            'sm:w-1/2': size === 'large',
            'sm:max-w-[750px]': size === 'large',
          },
        )}
      >
        <div
          className={clsx('relative bg-[var(--theme-color-background-section)] p-8 rounded-md shadow-lg', {
            hidden: modalState === 'closed',
          })}
        >
          {!shouldDisallowClosing && (
            <button
              className={clsx('absolute top-4 right-4', {
                'cursor-default': shouldDisallowClosing,
              })}
              onClick={closeHandler}
            >
              <TimesIcon variant={shouldDisallowClosing ? 'disabled' : 'standard'} />
            </button>
          )}
          {children}
        </div>
      </div>
    </>
  )
}
