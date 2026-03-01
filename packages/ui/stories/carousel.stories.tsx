import type { Meta, StoryObj } from '@storybook/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../src/components/ui/carousel.tsx';

const meta = {
  title: 'UI/Data Display/Carousel',
  component: Carousel,
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const slides = [
  { title: 'Slide 1', color: 'bg-primary/10' },
  { title: 'Slide 2', color: 'bg-secondary/30' },
  { title: 'Slide 3', color: 'bg-muted' },
  { title: 'Slide 4', color: 'bg-primary/10' },
  { title: 'Slide 5', color: 'bg-secondary/30' },
];

export const Default: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-xs">
      <Carousel>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div
                className={`${slide.color} flex aspect-square items-center justify-center rounded-lg border`}
              >
                <span className="text-2xl font-semibold">{slide.title}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
