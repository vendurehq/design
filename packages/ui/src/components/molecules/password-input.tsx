'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@vendure-io/ui/components/atoms/input-group';
import { VisibilityIcon } from '@vendure-io/ui/components/molecules/visibility-icon';
import * as React from 'react';
import { useMessages } from '../../lib/format-messages.ts';

export interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Accessible label for the reveal toggle while the password is hidden. @default `messages.passwordInput.showPassword`, "Show password" */
  showPasswordLabel?: string;
  /** Accessible label for the reveal toggle while the password is shown. @default `messages.passwordInput.hidePassword`, "Hide password" */
  hidePasswordLabel?: string;
}

/**
 * A password field with a show/hide toggle, composed from the InputGroup atoms.
 * Toggle labels come from `FormatProvider`'s `messages`; the label props win
 * over them.
 */
function PasswordInput({ showPasswordLabel, hidePasswordLabel, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const t = useMessages('passwordInput', {
    showPassword: showPasswordLabel,
    hidePassword: hidePasswordLabel,
  });

  return (
    <InputGroup>
      <InputGroupInput type={showPassword ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? t.hidePassword : t.showPassword}
        >
          <VisibilityIcon visible={!showPassword} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
