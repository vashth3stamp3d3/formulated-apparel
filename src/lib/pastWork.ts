export type PastWorkItem = {
  src: string;
  label: string;
  alt: string;
  rotate: number;
};

/** Studio-shot client work for the home hero film. */
export const pastWorkItems: PastWorkItem[] = [
  {
    src: "/images/past-work/work-01.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes cinnamon roll back print on black tee",
    rotate: -0.9,
  },
  {
    src: "/images/past-work/work-02.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes left-chest print on black tee",
    rotate: 0.5,
  },
  {
    src: "/images/past-work/work-03.jpg",
    label: "Prodigy Mechanical",
    alt: "Prodigy Mechanical branded tees",
    rotate: 1.1,
  },
  {
    src: "/images/past-work/work-04.jpg",
    label: "Fiesta 2025",
    alt: "Lethbridge Fiesta Extravaganza event tees",
    rotate: -0.7,
  },
  {
    src: "/images/past-work/work-05.jpg",
    label: "META",
    alt: "META gear logo hoodie, left chest",
    rotate: 0.8,
  },
  {
    src: "/images/past-work/work-06.jpg",
    label: "FBBC",
    alt: "FBBC team event tee",
    rotate: -1.1,
  },
  {
    src: "/images/past-work/work-07.jpg",
    label: "Identity Crisis",
    alt: "Identity Crisis graphic tee print",
    rotate: 0.6,
  },
  {
    src: "/images/past-work/work-08.jpg",
    label: "Formulated",
    alt: "Formulated constellation left-chest crewneck",
    rotate: -0.5,
  },
  {
    src: "/images/past-work/work-09.jpg",
    label: "Legacy Decks",
    alt: "Legacy Decks Ltd company hoodie order",
    rotate: 1.0,
  },
];

/** Two staggered rows for the scrolling hero. */
export function pastWorkRows() {
  const a: PastWorkItem[] = [];
  const b: PastWorkItem[] = [];
  pastWorkItems.forEach((item, index) => {
    if (index % 2 === 0) a.push(item);
    else b.push(item);
  });
  return [a, b] as const;
}
