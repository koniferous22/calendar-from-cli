import { useCallback, useEffect, useState } from 'react'

type ModalState = 'open' | 'closing' | 'closed'

type UseModalStateOptions = {
  initialOpen: boolean
  modalTransitionDuration: number
  shouldDisallowClosing: boolean
}

const defaultUseModalStateOptions: UseModalStateOptions = {
  initialOpen: false,
  modalTransitionDuration: 150,
  shouldDisallowClosing: false,
}

export const useModalState = ({
  initialOpen: initialOpenParam,
  modalTransitionDuration: modalTransitionDurationParam,
  shouldDisallowClosing: shouldDisallowClosingParam,
}: Partial<UseModalStateOptions> = {}) => {
  const initialOpen = initialOpenParam ?? defaultUseModalStateOptions.initialOpen
  const modalTransitionDuration = modalTransitionDurationParam ?? defaultUseModalStateOptions.modalTransitionDuration
  const shouldDisallowClosing = shouldDisallowClosingParam ?? defaultUseModalStateOptions.shouldDisallowClosing
  const [modalState, setModalState] = useState<ModalState>('closed')
  const openModalHandler = () => setModalState('open')
  const closeModalHandler = useCallback(() => {
    if (!shouldDisallowClosing) {
      setModalState('closing')
      return setTimeout(() => setModalState('closed'), modalTransitionDuration)
    }
  }, [])
  useEffect(() => {
    if (initialOpen) {
      setModalState('open')
    }
  }, [])
  useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalState === 'open') {
        closeModalHandler()
      }
    }

    window.addEventListener('keydown', escHandler)

    return () => {
      window.removeEventListener('keydown', escHandler)
    }
  }, [modalState, closeModalHandler])
  return {
    modalState,
    openModalHandler,
    closeModalHandler,
  }
}
