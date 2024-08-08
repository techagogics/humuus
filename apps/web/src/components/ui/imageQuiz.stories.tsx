import type { Meta, StoryObj } from '@storybook/react';

import ImageQuiz from './imageQuiz';

const meta: Meta<typeof ImageQuiz> = {
  title: 'ImageQuiz',
  component: ImageQuiz,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ImageQuiz>;

export const Default: Story = {
  args: {
    images: ['real/1270', 'fake/4215'],
    answer: 2,
  },
};
