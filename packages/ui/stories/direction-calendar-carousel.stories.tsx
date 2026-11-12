import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Calendar } from '../src/components/atoms/calendar.tsx';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../src/components/atoms/carousel.tsx';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';

type Dir = 'ltr' | 'rtl';

const meta = {
  title: 'Atoms/Layout/Direction calendar and carousel',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A Calendar with a selected range, and a Carousel with its two buttons. */
function CalendarAndCarousel({ dir }: { dir: Dir }) {
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} className="flex items-start gap-24 px-20 py-8">
        <Calendar
          data-testid="calendar"
          mode="range"
          defaultMonth={new Date(2026, 10, 1)}
          selected={{ from: new Date(2026, 10, 10), to: new Date(2026, 10, 13) }}
          className="rounded-md border"
        />
        <Carousel data-testid="carousel" className="w-48">
          <CarouselContent>
            {[1, 2, 3].map((slide) => (
              <CarouselItem key={slide} data-testid={`slide-${slide}`}>
                <div className="bg-muted flex aspect-square items-center justify-center rounded-lg text-3xl font-semibold">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious data-testid="previous" />
          <CarouselNext data-testid="next" />
        </Carousel>
      </div>
    </DirectionProvider>
  );
}

function byId(root: HTMLElement, id: string) {
  const el = root.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`No element ${id}`);
  return el;
}

/**
 * Which side of its cell a range end joins the rest of the range on: a 16px
 * ::after strip fills the cell's rounded corners on that side.
 */
function joinSide(cell: HTMLElement) {
  const strip = getComputedStyle(cell, '::after');
  return parseFloat(strip.left) === 0 ? 'left' : parseFloat(strip.right) === 0 ? 'right' : 'none';
}

/** Which side of a chevron's box its point is on. */
function chevronPoints(button: HTMLElement) {
  const svg = button.querySelector('svg')!;
  const rotated = getComputedStyle(svg).rotate === '180deg';
  const drawnLeft = svg.classList.contains('lucide-chevron-left');
  return drawnLeft !== rotated ? 'left' : 'right';
}

/**
 * In both directions: each range end joins the range on its inner side, the previous
 * buttons sit and point at the start side, and the next buttons at the end.
 */
async function expectDirection(root: HTMLElement, dir: Dir) {
  const start = dir === 'rtl' ? 'right' : 'left';
  const end = dir === 'rtl' ? 'left' : 'right';
  const calendar = byId(root, 'calendar');
  const rangeStart = calendar.querySelector<HTMLElement>('.rdp-range_start')!;
  const rangeEnd = calendar.querySelector<HTMLElement>('.rdp-range_end')!;
  const carousel = byId(root, 'carousel').getBoundingClientRect();
  const previous = byId(root, 'previous');
  const next = byId(root, 'next');
  const sideOf = (button: HTMLElement) => (button.getBoundingClientRect().right <= carousel.left ? 'left' : 'right');
  await expect({
    rangeStartJoins: joinSide(rangeStart),
    rangeEndJoins: joinSide(rangeEnd),
    calendarPreviousPoints: chevronPoints(calendar.querySelector('.rdp-button_previous')!),
    calendarNextPoints: chevronPoints(calendar.querySelector('.rdp-button_next')!),
    carouselPreviousSide: sideOf(previous),
    carouselPreviousPoints: chevronPoints(previous),
    carouselNextSide: sideOf(next),
    carouselNextPoints: chevronPoints(next),
  }).toEqual({
    rangeStartJoins: end,
    rangeEndJoins: start,
    calendarPreviousPoints: start,
    calendarNextPoints: end,
    carouselPreviousSide: start,
    carouselPreviousPoints: start,
    carouselNextSide: end,
    carouselNextPoints: end,
  });
  // Next brings in slide 2 over the carousel; the arrow key toward the end
  // side does the same.
  const content = byId(root, 'carousel').querySelector('[data-slot=carousel-content]')!.getBoundingClientRect();
  const showing = (slide: number) => Math.abs(byId(root, `slide-${slide}`).getBoundingClientRect().left - content.left) < 20;
  await expect(showing(1)).toBe(true);
  // The button turns on once Embla has measured the slides.
  await waitFor(() => expect(next).toBeEnabled());
  await userEvent.click(next);
  await waitFor(() => expect(showing(2)).toBe(true), { timeout: 3000 });
  byId(root, 'carousel').focus();
  await userEvent.keyboard(dir === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
  await waitFor(() => expect(showing(3)).toBe(true), { timeout: 3000 });
}

/** Right to left: the range, the month buttons and the slide buttons mirror. */
export const CalendarAndCarouselRightToLeft: Story = {
  render: () => <CalendarAndCarousel dir="rtl" />,
  play: async ({ canvasElement }) => expectDirection(canvasElement, 'rtl'),
};

/** Left to right, the same atoms: the look this change keeps. */
export const CalendarAndCarouselLeftToRight: Story = {
  render: () => <CalendarAndCarousel dir="ltr" />,
  play: async ({ canvasElement }) => expectDirection(canvasElement, 'ltr'),
};
