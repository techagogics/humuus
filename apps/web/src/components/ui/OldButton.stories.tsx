import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './OldButton';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Click Me!',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'lg',
  },
};

export const Primary: Story = {
  args: {
    children: 'Click Me!',
    variant: 'primary',
    size: 'lg',
  },
};

export const Danger: Story = {
  args: {
    children: 'Click Me!',
    variant: 'danger',
    size: 'lg',
  },
};
