'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@vendure-io/ui/components/atoms/input-group';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

export interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Accessible label for the reveal toggle while the password is hidden. */
  showPasswordLabel?: string;
  /** Accessible label for the reveal toggle while the password is shown. */
  hidePasswordLabel?: string;
}

/**
 * A password field with a show/hide toggle, composed from the InputGroup atoms.
 * Toggle labels are props so consumers can localize them — the design system
 * carries no i18n runtime of its own.
 */
function PasswordInput({
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={showPassword ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
