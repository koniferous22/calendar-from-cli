import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

type Props = {
  isDisabled?: boolean
}

export const ChevronNext = ({ isDisabled }: Props) => {
  const colorCssVar = isDisabled ? '--theme-color-font-disabled' : '--theme-color-font'
  return <FontAwesomeIcon icon={faChevronRight} className="fa-2x" color={`var(${colorCssVar})`} />
}
