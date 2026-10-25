// V03 · "آخرین شبِ شهر" — 13 vertical ~30s episodes in a code-drawn shadow-noir style. Direction: videos/03/direction.md
import React from "react";
import { Composition } from "remotion";
import { Cast } from "./Cast";
import { FPS, H, W } from "./lib";
import { Episode, type Shot, type VO } from "./ui";
import * as E01 from "./e01";
import * as E02 from "./e02";
import * as E03 from "./e03";

const EP = [
  { id: "V03-E01", m: E01, title: "آخرین شبِ شهر", sub: "قسمت اول · کسی پشت در بود", next: "قسمت دوم", audio: "v03/e01/mix.wav" },
  { id: "V03-E03", m: E03, title: "آخرین شبِ شهر", sub: "قسمت سوم · از پشت چشمی", next: "قسمت چهارم · سامان چی دیده؟", audio: "v03/e03/mix.wav" },
  { id: "V03-E02", m: E02, title: "آخرین شبِ شهر", sub: "قسمت دوم · ذرت می‌دونست", next: "قسمت سوم", audio: "v03/e02/mix.wav" },
];

// props must be JSON (Remotion serialises them), so each composition gets a wrapper that holds its shot functions
type EpMod = { SHOTS: Shot[]; vo: VO; TOTAL: number; LOOK: number[] };
const make = (m: EpMod, title: string, sub: string, next: string) =>
  ({ audio, look }: { audio?: string; look?: boolean }) => <Episode shots={m.SHOTS} vo={m.vo} total={m.TOTAL} title={title} sub={sub} next={next} audio={audio} times={look ? m.LOOK : undefined} />;
const COMP = Object.fromEntries(EP.map((e) => [e.id, make(e.m, e.title, e.sub, e.next)]));

export const V03: React.FC = () => (
  <>
    <Composition id="V03-Cast" component={Cast} durationInFrames={1} fps={FPS} width={W} height={H} />
    {EP.map(({ id, m, audio }) => {
      const frames = Math.round(m.TOTAL * FPS);
      return (
        <React.Fragment key={id}>
          <Composition id={id} component={COMP[id]} durationInFrames={frames} fps={FPS} width={W} height={H} defaultProps={{ audio }} />
          <Composition id={`${id}-Silent`} component={COMP[id]} durationInFrames={frames} fps={FPS} width={W} height={H} defaultProps={{}} />
          <Composition id={`${id}-Look`} component={COMP[id]} durationInFrames={m.LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ look: true }} />
        </React.Fragment>
      );
    })}
  </>
);
