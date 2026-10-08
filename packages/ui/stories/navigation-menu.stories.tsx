import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../src/components/atoms/navigation-menu.tsx';

const meta = {
  title: 'Atoms/Menus/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-1 p-2 md:grid-cols-2">
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Introduction</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Re-usable components built with Base UI and Tailwind CSS.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Installation</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      How to install dependencies and structure your app.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Typography</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Styles for headings, paragraphs, lists and more.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Theming</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Customize the look and feel using CSS variables.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-1 p-2 md:grid-cols-2">
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Alert Dialog</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      A modal dialog that interrupts the user with important content.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Hover Card</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Preview content available behind a link.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Tooltip</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      A popup that displays information on hover.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Progress</div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Displays an indicator for task completion.
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="px-4 py-2 text-sm font-medium">
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The active link (`active`) gets foreground text, medium weight and an
 * underline. The trigger is transparent, so it does not show as a patch on a
 * card. Tab through to see the focus ring. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="bg-card rounded-lg border p-2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Catalog</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#">Products</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#" active>
                  Orders
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Customers</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </LightAndDark>
  ),
};
