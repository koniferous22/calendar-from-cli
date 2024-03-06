import { useModalState } from '../../../hooks/useModalState'
import { Banner } from '../../Banner/banner'
import { Button } from '../../Button/button'
import { PasswordInput } from '../../Input/PasswordInput/passwordInput'
import { GenericModal } from '../Generic/genericModal'

type Props = {
  modalState: ReturnType<typeof useModalState>['modalState']
  errorMessage?: string
  onModalClose: () => void
  onErrorBannerClose: () => void
  onPwdChange: (value: string) => void
  onSubmit: () => void
  shouldDisallowClosing?: boolean
  isAuthLoading?: boolean
}

export const AuthModal = ({
  isAuthLoading,
  modalState,
  onModalClose,
  onPwdChange,
  onSubmit,
  errorMessage,
  onErrorBannerClose,
  shouldDisallowClosing,
}: Props) => {
  return (
    <GenericModal
      size="medium"
      modalState={modalState}
      onClose={onModalClose}
      shouldDisallowClosing={shouldDisallowClosing}
    >
      <form
        className="m-auto w-5/6 flex flex-col gap-5 items-center"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div>Enter Password</div>
        <PasswordInput onChange={onPwdChange} />
        {errorMessage && <Banner variant={'error'} message={errorMessage} onCancel={onErrorBannerClose} />}
        <div className="w-[100px]">
          <Button label={'Sign In'} onClick={onSubmit} isLoading={isAuthLoading} />
        </div>
      </form>
    </GenericModal>
  )
}
