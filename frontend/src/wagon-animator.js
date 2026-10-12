const FRAME_COUNT = 4;

function buildGround(shift = 0) {
  const base = '....::.. ..::.... ..::.... ..::.... ..::.... ..::....';
  const normalized = shift % base.length;
  return `${base.slice(normalized)}${base.slice(0, normalized)}`;
}

function frame(wheelA, wheelB, oxLegLeft, oxLegRight, scoutLegLeft, scoutLegRight, tail, groundShift) {
  const ground = buildGround(groundShift);
  return [
    '                              .:-=+*#%%#*+=-:.                                ',
    '                    .::-=*#%@@@@@@@@@@@@@@@@%#*=-::.                          ',
    '               .:-+%@@@@@@@%%%%###**++**###%%%%@@@@@@@%+-:.                   ',
    `      ${tail}__      .-*%@@%#*+=-:.                  .:-=+*#%@@%*-.        _==_       `,
    '   .-\'  \'-.   :=#@@#+-.      .:--===--:.        .-+#@@#=:     .-\'  \'-.    ',
    ' _/  @@ @@ \\_  *@@*:      .-+%@@@@@@@@@@%+-     :*@@*      _/  _  _ \\_   ',
    `/<  /\\/\\/\\  >\\  %@+     .+@@@#=.      .=#@@@+.   +@%     /< _/${oxLegLeft}${oxLegRight}\\_ \\\\>\\  `,
    '| | | ()() | |  %@-    -@@@=   .-====-.   =@@@-  -@%     | |/  ____  \\| |  ',
    '|_|_|_/__\\_|_|  %@-    @@@   :#@@@@@@@@#:   @@@   -@%     |_|  / __ \\  |_|  ',
    `  /_/ ${scoutLegLeft}${scoutLegRight}  \\_\\   %@-    @@@   @@@${wheelA}    ${wheelB}@@@   @@@   -@%      /_/  __  \\_\\   `,
    '     //  \\\\      %@=    +@@@.  .*####*.  .@@@+   =@%         //  \\\\        ',
    '  ___/____\\___   #@@+.   .+@@@#=:  :=#@@@+.   .+@@#    ____/____\\____     ',
    ` /___${wheelA}____${wheelB}___\\\\  :%@@@#+-.          .-+#@@@%:    /___${wheelB}____${wheelA}___\\\\    `,
    ` ${ground} `
  ].join('\n');
}

const FRAMES = [
  frame('\\', '/', '/', '\\\\', '/', '\\\\', '~', 0),
  frame('|', '|', '|', '|', '|', '|', '^', 4),
  frame('/', '\\', '\\\\', '/', '\\\\', '/', '~', 8),
  frame('|', '|', '|', '|', '|', '|', '^', 12)
];

export function getWagonFrame(index = 0) {
  return FRAMES[Math.abs(index) % FRAME_COUNT];
}

export function getIdleWagonFrame() {
  return FRAMES[0];
}

export function getFrameCount() {
  return FRAME_COUNT;
}
