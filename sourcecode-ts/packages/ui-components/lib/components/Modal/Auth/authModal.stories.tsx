import type { Meta, StoryObj } from '@storybook/react'

import { AuthModal } from './authModal'
import { useModalState } from '../../../hooks/useModalState'
import { useEffect } from 'react'

const meta: Meta<typeof AuthModal> = {
  component: AuthModal,
}

export default meta
type Story = StoryObj<typeof AuthModal>

type Props = Parameters<typeof AuthModal>[0]

export const Primary: Story = {
  args: {
    modalState: 'open',
    shouldDisallowClosing: true,
  },
  render: ({ modalState: modalStateProp, errorMessage, shouldDisallowClosing }: Props) => {
    const { modalState, openModalHandler, closeModalHandler } = useModalState({
      initialOpen: modalStateProp === 'open',
      modalTransitionDuration: 150,
      shouldDisallowClosing: true,
    })
    useEffect(() => {
      if (modalStateProp === 'open') {
        openModalHandler()
      } else if (modalStateProp === 'closed') {
        closeModalHandler()
      }
    }, [modalStateProp])
    return (
      <AuthModal
        modalState={modalState}
        onModalClose={closeModalHandler}
        errorMessage={errorMessage}
        onSubmit={() => {}}
        onPwdChange={() => {}}
        onErrorBannerClose={() => {}}
        shouldDisallowClosing={shouldDisallowClosing}
      />
    )
  },
}

export const WithError: Story = {
  ...Primary,
  args: {
    ...Primary.args,
    errorMessage:
      'Invalid Password Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas in arcu eget massa placerat mattis non vitae mauris. Donec nec pellentesque nunc. Nunc vitae arcu vel metus suscipit auctor in in est. Nam aliquam et enim ac sodales. Sed condimentum, purus quis laoreet lacinia, ante odio rutrum tortor, ac lobortis augue dolor non dolor. Sed fringilla diam consectetur massa bibendum, vel viverra velit ultrices. Ut eu dui massa. ',
  },
}
