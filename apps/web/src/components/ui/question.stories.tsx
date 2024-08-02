import type { Meta, StoryObj } from '@storybook/react';

import Question from './question';

const meta: Meta<typeof Question> = {
  title: 'Questions',
  component: Question,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Question>;

export const Default: Story = {
  args: {
    question: 'Das ist eine Frage die gestellt wird!',
    answers: [
      'Das ist Antwort A',
      'Das ist Antwort B',
      'Das ist Antwort C',
      'Das ist Antwort D',
    ],
    answer: [1],
  },
};
