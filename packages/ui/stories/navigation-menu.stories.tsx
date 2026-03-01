import type { Meta, StoryObj } from '@storybook/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../src/components/ui/navigation-menu.tsx';

const meta = {
  title: 'UI/Menus/NavigationMenu',
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
                      Re-usable components built with Radix UI and Tailwind CSS.
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
