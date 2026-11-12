import type { ComponentChildren } from 'preact'

/**
 * Label, control and explanation for one field in a bindings/actions row.
 *
 * The hint is part of the field rather than a tooltip because both panels
 * expect knowledge the card never states anywhere else — which CSS selector
 * syntax applies, what `this` refers to inside a call — and a config UI that
 * hides that behind a hover is no use on the tablet.
 */
export function RuleField ({
  label,
  hint,
  invalid = false,
  children
}: {
  label: string
  hint?: string
  invalid?: boolean
  children: ComponentChildren
}) {
  return (
    <label class='flex min-w-0 flex-col gap-1'>
      <span class='flex items-baseline gap-2 text-xs font-medium'>
        {label}
        {invalid && <span class='text-warning'>required</span>}
      </span>
      {children}
      {hint && <span class='text-[11px] leading-snug opacity-60'>{hint}</span>}
    </label>
  )
}
