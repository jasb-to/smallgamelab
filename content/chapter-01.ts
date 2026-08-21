export const chapterOne = {
  title: "The Delivery",
  protagonist: "Mara Vale",
  opening: "18:42. District 7 goes dark. Mara's courier tag pings once: RUN.",
  mission: "Get the data shard to Relay 9 before the lockdown reaches the rooftops.",
  beats: [
    { at: 0, title: "LOCKDOWN", text: "Sirens start below. Mara takes the roofline." },
    { at: 500, title: "THE SHARD", text: "Courier 17 is carrying something someone wants back." },
    { at: 1000, title: "PURSUIT", text: "A surveillance drone locks onto Mara." },
    { at: 1500, title: "RELAY 9", text: "The route ends at a door marked with a symbol Mara has seen before." },
  ],
  cliffhanger: "The relay opens. The screen says: COURIER 17 — WE HAVE BEEN WAITING.",
} as const;
