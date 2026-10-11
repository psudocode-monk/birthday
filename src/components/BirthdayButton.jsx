import styles from './BirthdayButton.module.css'

/**
 * The one button used across the whole journey.
 * Big, warm, comfortable to tap (min 52px tall), with a soft press
 * response that feels good on a touchscreen.
 */
export default function BirthdayButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  className = '',
  ...rest
}) {
  const classes = [styles.button, styles[variant], disabled ? styles.disabled : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} {...rest}>
      <span className={styles.label}>{children}</span>
    </button>
  )
}
