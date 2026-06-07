// ─── /sp-fact — Random space fact (local, instant) ──────────

const SPACE_FACTS = [
  "🪐 Saturn's density is so low that it would *float in water*!",
  "☀️ The Sun makes up **99.86%** of all mass in our solar system.",
  "🌍 A day on Venus is **longer** than a year on Venus.",
  "🌙 The Moon is slowly drifting away from Earth at **3.8 cm per year**.",
  "🛸 There are **more stars** in the universe than **grains of sand** on Earth.",
  "⚡ A single lightning bolt on Jupiter is **1,000x more powerful** than Earth's.",
  "⏰ Neutron stars can spin **600 times per second!**",
  "🌌 The largest known star, UY Scuti, could fit **5 billion Suns** inside it.",
  "🌠 Space is **completely silent** — no air for sound to travel.",
  "🔴 A day on Mars is only **40 minutes longer** than a day on Earth.",
  "💫 The ISS travels at **17,500 mph** (28,000 km/h).",
  "☄️ **Over 1 million Earths** could fit inside the Sun!",
  "🌑 One teaspoon of neutron star material would weigh **10 million tons**.",
  "🌌 The Andromeda Galaxy is on a collision course with the Milky Way — in **4.5 billion years!**",
  "🧊 There's a cloud of water in space containing **140 trillion times** Earth's oceans.",
  "🚀 The fastest human-made object, Parker Solar Probe, travels at **430,000 mph**.",
  "🔭 The Hubble Space Telescope has made over **1.5 million observations**.",
  "🛸 There's a planet where it rains **glass sideways** — HD 189733b.",
  "🌑 The Moon has **moonquakes** caused by Earth's gravity.",
  "⏳ If you could travel at light speed, you'd reach Mars in just **3 minutes**.",
];

module.exports = function (app, { BOT_PREFIX, BOT_NAME }) {
  app.command(`/${BOT_PREFIX}-fact`, async ({ command, ack, respond }) => {
    await ack();

    const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];

    await respond({
      text: `🌌 Space Fact: ${fact}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🌌 *Space Fact* 🚀\n\n${fact}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `✨ <@${command.user_id}> · Instant (local data, no API) · ${SPACE_FACTS.length} facts available`,
            },
          ],
        },
      ],
    });
  });
};