import type { Meta, StoryObj } from '@storybook/react';

import PlayerList from './PlayerList';

const meta: Meta<typeof PlayerList> = {
  title: 'PlayerList',
  component: PlayerList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PlayerList>;

export const Default: Story = {
  args: {
    users: ['Test', 'Test', 'Test', 'Test'],
  },
};
