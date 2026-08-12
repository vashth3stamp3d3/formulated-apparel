export type PastWorkItem = {
  src: string;
  label: string;
  alt: string;
  rotate: number;
};

/** Studio-shot portfolio for the home hero film — unique brands only. */
export const pastWorkItems: PastWorkItem[] = [
  {
    src: "/images/past-work/work-01.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes cinnamon roll back print on black tee",
    rotate: -0.9,
  },
  {
    src: "/images/past-work/work-02.jpg",
    label: "Prodigy Mechanical",
    alt: "Prodigy Mechanical branded tees",
    rotate: 1.1,
  },
  {
    src: "/images/past-work/work-03.jpg",
    label: "Fiesta 2025",
    alt: "Lethbridge Fiesta Extravaganza event tees",
    rotate: -0.7,
  },
  {
    src: "/images/past-work/work-04.jpg",
    label: "META",
    alt: "META gear logo hoodie, left chest",
    rotate: 0.8,
  },
  {
    src: "/images/past-work/work-05.jpg",
    label: "Identity Crisis",
    alt: "Identity Crisis graphic tee print",
    rotate: 0.6,
  },
  {
    src: "/images/past-work/work-06.jpg",
    label: "Formulated",
    alt: "Formulated constellation left-chest crewneck",
    rotate: -0.5,
  },
  {
    src: "/images/past-work/work-07.jpg",
    label: "Legacy Decks",
    alt: "Legacy Decks Ltd company hoodie order",
    rotate: 1.0,
  },
  {
    src: "/images/past-work/work-08.jpg",
    label: "Northpine",
    alt: "Northpine Outfitters branded hoodie",
    rotate: -0.8,
  },
  {
    src: "/images/past-work/work-09.jpg",
    label: "Copperline Electric",
    alt: "Copperline Electric company tee",
    rotate: 0.7,
  },
  {
    src: "/images/past-work/work-10.jpg",
    label: "Driftwood Coffee",
    alt: "Driftwood Coffee Co branded hoodie",
    rotate: -0.6,
  },
  {
    src: "/images/past-work/work-11.jpg",
    label: "Peakline Scaffolding",
    alt: "Peakline Scaffolding back-print tee",
    rotate: 0.9,
  },
  {
    src: "/images/past-work/work-12.jpg",
    label: "Hollow & Pine",
    alt: "Hollow & Pine Studio crewneck",
    rotate: -1.0,
  },
  {
    src: "/images/past-work/work-13.jpg",
    label: "Redshift Athletics",
    alt: "Redshift Athletics navy hoodie",
    rotate: 0.4,
  },
  {
    src: "/images/past-work/work-14.jpg",
    label: "Prairie Volt",
    alt: "Prairie Volt Energy left-chest tee",
    rotate: -0.4,
  },
];

/** Two staggered rows — no cross-row reuse of the same Soft Bakes shot. */
export function pastWorkRows() {
  const mid = Math.ceil(pastWorkItems.length / 2);
  return [pastWorkItems.slice(0, mid), pastWorkItems.slice(mid)] as const;
}
