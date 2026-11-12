import { Fragment } from "react";
import { motion } from "motion/react";

import { box, camera, cylinder, type Vec3 } from "./iso";
import { C, Guide, Solid, WALLET, drop, wallet } from "./shared";

/**
 * History, "one send, many receipts": a coin, the payment, sits at the back of
 * a row of wallets on the same axis as the Lists tray. Pieces of it hop down
 * the row onto each wallet, then a receipt lands beside each one, a parallel
 * row like lines in a ledger. The receipts hold the bright edge: they're what
 * this page will list.
 */

const COIN = { x: -30, r: 8, h: 3 };
const PIECE = { r: 3.6, h: 1.2 };
const WALLETS = [-8, 7, 22, 37];
const RECEIPT = { w: 9, d: 6, y: 12, h: 1 };

const CAM = camera(
  2.05,
  [
    [COIN.x - COIN.r, -COIN.r, 0],
    ...WALLETS.flatMap((x): Vec3[] => [
      [x, -WALLET.r, WALLET.h + 8],
      [x + WALLET.r, RECEIPT.y + RECEIPT.d / 2, 0],
    ]),
  ],
  80,
  82,
);

const T = { guide: 0, coin: 0.15, wallets: 0.35, send: 0.95, step: 0.12, receipts: 1.6 };

/** When the entrance has settled, in seconds: the last receipt's drop. */
export const HISTORY_DURATION = T.receipts + (WALLETS.length - 1) * 0.08 + 0.5;

export function HistoryScene() {
  const [ox, oy] = CAM.P(COIN.x, 0, COIN.h);

  return (
    <g strokeWidth={1} strokeLinecap="round">
      <Guide from={CAM.P(COIN.x - 12, 0, 0)} to={CAM.P(46, 0, 0)} delay={T.guide} />

      <motion.g {...drop(T.coin)}>
        <Solid solid={cylinder(CAM, COIN.x, 0, COIN.r, 1.6, 0, COIN.h)} />
      </motion.g>

      {WALLETS.map((x, i) => {
        const [dx, dy] = CAM.P(x, 0, WALLET.h);
        const send = T.send + i * T.step;
        return (
          <Fragment key={x}>
            <motion.g {...drop(T.wallets + i * 0.06)}>
              <Solid solid={wallet(CAM, x, 0)} />
            </motion.g>

            {/* Drawn where it lands, on its wallet, and starts offset back onto the coin. */}
            <motion.g
              initial={{ x: ox - dx, y: oy - dy, opacity: 0 }}
              animate={{ x: 0, y: [oy - dy, Math.min(oy - dy, 0) - 10, 0], opacity: 1 }}
              transition={{
                x: { duration: 0.45, delay: send, ease: "easeInOut" },
                y: { duration: 0.45, delay: send, ease: "easeInOut", times: [0, 0.5, 1] },
                opacity: { duration: 0.01, delay: send },
              }}
            >
              <Solid solid={cylinder(CAM, x, 0, PIECE.r, 1, WALLET.h, WALLET.h + PIECE.h)} />
            </motion.g>

            <motion.g {...drop(T.receipts + i * 0.08, 6)}>
              <Solid
                solid={box(
                  CAM,
                  [x - RECEIPT.w / 2, RECEIPT.y - RECEIPT.d / 2, x + RECEIPT.w / 2, RECEIPT.y + RECEIPT.d / 2],
                  1.5,
                  1,
                  0,
                  RECEIPT.h,
                )}
                edge={C.ink}
              />
            </motion.g>
          </Fragment>
        );
      })}
    </g>
  );
}
