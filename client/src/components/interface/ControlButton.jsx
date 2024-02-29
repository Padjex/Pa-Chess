import { AnimatePresence, motion } from "framer-motion";
import "../../css/controlButton.css";
import useGame from "../../store/useGame";
import { useEffect, useState } from "react";
import useResponsive from "../../store/useResponsive";

export default function ControlButtonsNew() {
  const onMove = useGame((state) => state.onMove);
  const opponentOnMove = useGame((state) => state.opponentOnMove);
  const onMoveConfirm = useGame((state) => state.onMoveConfirm);
  const onMoveUndo = useGame((state) => state.onMoveUndo);
  const selectedNewPiece = useGame((state) => state.selectedNewPiece);

  const screenPosition = useGame((state) => state.screenPosition);

  const showControls = onMove === false && opponentOnMove === false;

  const confirmMove = () => {
    onMoveConfirm();
  };

  const undoMove = () => {
    onMoveUndo();
  };

  const isMobile = useResponsive((state) => state.isMobile);

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="controls-wrapper"
          style={{
            top: isMobile ? screenPosition[1] - 40 : screenPosition[1] - 90,
            left: isMobile ? screenPosition[0] + 6 : screenPosition[0] + 20,
          }}
          exit={{
            scale: 0,
            transition: {
              duration: 0.14,
              ease: "circOut",
              type: "spring",
            },
          }}
        >
          {selectedNewPiece && (
            <motion.button
              className="btn-confirm-move"
              onClick={confirmMove}
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
                transition: {
                  duration: 0.24,

                  type: "spring",
                  mass: 5,
                  stiffness: 450,
                  damping: 50,
                  restDelta: 0.0005,
                },
              }}
            >
              &#10003;
            </motion.button>
          )}
          <motion.button
            className="btn-undo-move"
            onClick={undoMove}
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
              transition: {
                delay: 0.1,
                duration: 0.24,

                type: "spring",
                mass: 5,
                stiffness: 450,
                damping: 50,
                restDelta: 0.0005,
              },
            }}
          >
            &#8634;
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
